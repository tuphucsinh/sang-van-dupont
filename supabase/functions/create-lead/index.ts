// create-lead — nhận lead từ form website, validate + rate limit, lưu leads, gửi Telegram
// Secrets (env): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SUPABASE_SERVICE_ROLE_KEY (tự có)
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://sangdupont.vercel.app";
const RATE_LIMIT = 5; // lead/giờ/IP
const RATE_WINDOW_HOURS = 1;

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export default {
  fetch: async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "JSON không hợp lệ" }, 400);
    }

    const type = String(body.type || "buy");
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const budget = String(body.budget || "").trim().slice(0, 500);
    const need = String(body.need || "").trim().slice(0, 500);
    const line_interest = String(body.line_interest || "").trim().slice(0, 200);
    const channel = String(body.channel || "web_form").trim().slice(0, 50);
    const attachments = Array.isArray(body.attachments) ? body.attachments.slice(0, 3) : [];

    // Validate
    if (!["buy", "maintenance"].includes(type)) return json({ ok: false, error: "Loại yêu cầu không hợp lệ" }, 400);
    if (!name || name.length > 200) return json({ ok: false, error: "Vui lòng nhập tên (tối đa 200 ký tự)" }, 400);
    if (!/^[0-9+\s-]{8,15}$/.test(phone)) return json({ ok: false, error: "Số điện thoại không hợp lệ" }, 400);

    // Rate limit: đếm lead cùng IP trong 1 giờ qua meta->>'ip'
    const ip = clientIp(req);
    const { count, error: countErr } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - RATE_WINDOW_HOURS * 3600_000).toISOString())
      .eq("meta->>ip", ip);
    if (countErr) return json({ ok: false, error: "Lỗi kiểm tra rate limit" }, 500);
    if ((count || 0) >= RATE_LIMIT) {
      return json({ ok: false, error: "Quá nhiều yêu cầu — vui lòng thử lại sau 1 giờ" }, 429);
    }

    // Insert lead
    const { data: lead, error: insertErr } = await supabase
      .from("leads")
      .insert({
        type,
        name,
        phone,
        budget: budget || null,
        need: need || null,
        line_interest: line_interest || null,
        channel: channel || null,
        status: "new",
        meta: { ip, source: "web_form", submitted_at: new Date().toISOString() },
      })
      .select("id, name, phone, type, budget, need, line_interest, channel, created_at")
      .single();
    if (insertErr || !lead) {
      console.error("insert lead fail:", insertErr?.message);
      return json({ ok: false, error: "Không lưu được yêu cầu — thử lại sau" }, 500);
    }

    // Attachments (ảnh private, ≤3, tổng raw ≤3MB) — upload qua service role vào lead-attachments
    const b64ToBytes = (b64: string): Uint8Array => {
      const bin = atob(b64);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    };
    let savedAttachments = 0;
    if (attachments.length > 0) {
      let totalBytes = 0;
      for (const a of attachments) {
        const b64 = typeof a?.base64 === "string" ? a.base64 : "";
        totalBytes += b64ToBytes(b64).length;
      }
      if (totalBytes > 3 * 1024 * 1024) {
        return json({ ok: false, error: "Tổng ảnh tối đa 3MB" }, 400);
      }
      for (const [i, a] of attachments.entries()) {
        const b64 = typeof a?.base64 === "string" ? a.base64 : "";
        const name = typeof a?.name === "string" ? a.name : `anh-${i + 1}.jpg`;
        if (!b64) continue;
        const raw = b64ToBytes(b64);
        if (raw.length === 0 || raw.length > 1.5 * 1024 * 1024) continue;
        const ext = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `leads/${lead.id}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("lead-attachments")
          .upload(path, raw, { contentType: "image/jpeg", upsert: false });
        if (upErr) {
          console.error("upload attach fail:", upErr.message);
          continue;
        }
        const { error: attErr } = await supabase.from("lead_attachments").insert({
          lead_id: lead.id,
          storage_path: path,
          storage_bucket: "lead-attachments",
        });
        if (attErr) console.error("insert attach fail:", attErr.message);
        else savedAttachments++;
      }
    }

    // Telegram notification
    const token = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID") || "";
    const typeLabel = type === "buy" ? "🛒 TƯ VẤN MUA" : "🔧 BẢO DƯỠNG";
    const text = [
      `🔔 <b>Lead mới — ${typeLabel}</b>`,
      `👤 <b>${escapeHtml(name)}</b>`,
      `📞 ${escapeHtml(phone)}`,
      budget ? `💰 ${escapeHtml(budget)}` : "",
      need ? `📝 ${escapeHtml(need)}` : "",
      line_interest ? `🔥 Dòng quan tâm: ${escapeHtml(line_interest)}` : "",
      channel ? `📡 Kênh: ${escapeHtml(channel)}` : "",
      `🕐 ${new Date(lead.created_at).toLocaleString("vi-VN")}`,
      `#${lead.id.slice(0, 8)}`,
    ]
      .filter(Boolean)
      .join("\n");
    try {
      if (token && chatId) {
        const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: Number(chatId), text, parse_mode: "HTML" }),
        });
        if (!tgRes.ok) {
          console.error("telegram send http fail:", tgRes.status, await tgRes.text());
        }
        // Gửi kèm ảnh (nếu lead có attachment) — tải từ Storage private bằng service role rồi upload multipart
        if (savedAttachments > 0) {
          const { data: attRows, error: attListErr } = await supabase
            .from("lead_attachments")
            .select("storage_path")
            .eq("lead_id", lead.id)
            .order("created_at", { ascending: true })
            .limit(3);
          if (!attListErr && attRows) {
            for (const row of attRows) {
              const { data: fileBlob, error: dlErr } = await supabase.storage
                .from("lead-attachments")
                .download(row.storage_path);
              if (dlErr || !fileBlob) {
                console.error("download attach for telegram fail:", dlErr?.message);
                continue;
              }
              const form = new FormData();
              form.set("chat_id", String(chatId));
              form.set("photo", fileBlob, "attachment.jpg");
              form.set("caption", `📎 Ảnh đính kèm — ${typeLabel}\n👤 ${escapeHtml(name)} · #${lead.id.slice(0, 8)}`);
              const photoRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
                method: "POST",
                body: form,
              });
              if (!photoRes.ok) {
                console.error("telegram sendPhoto fail:", photoRes.status, await photoRes.text());
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("telegram send fail:", (e as Error).message);
      // không fail request chính — lead đã lưu
    }

    return json({ ok: true, lead_id: lead.id, request_code: lead.id.slice(0, 8) }, 201);
  },
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
