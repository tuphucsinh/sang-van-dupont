// vision-intake — AI mô tả sơ bộ ảnh (P9T01, P9T03 mode=draft)
// Provider: opencode-go (AI_API_KEY) — model qwen3.8-max (vision verified 2026-08-14; gpt-5.6-luna text-only)
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://sangdupont.vercel.app";
const RATE_LIMIT_PER_HOUR = 30;
const MAX_IMG_BYTES = 1.5 * 1024 * 1024;
const TIMEOUT_MS = 60_000; // vision chậm hơn text — cần 60s (verified abort 25s)

const INTAKE_PROMPT = `Bạn là trợ lý tiếp nhận ảnh của SangDupont (bật lửa S.T. Dupont vintage).
Mô tả sơ bộ ảnh bằng tiếng Việt, tối đa 4 câu:
1. Vật phẩm/dáng gì (bật lửa, dòng dáng...).
2. Ảnh đủ góc chưa? Thiếu góc nào — gợi ý bổ sung (toàn thân trước/sau, đáy, 2 cạnh bên, cơ chế đánh lửa/mồi).
3. Đặc điểm/khuyết điểm nhìn thấy được (trầy, mạ bong, ố, mòn...).
4. KHÔNG xác nhận thật/giả, KHÔNG định giá, KHÔNG khẳng định năm sản xuất.
Trả lời text thuần (không markdown, không **).`;

const DRAFT_PROMPT = (name: string) => `Bạn là trợ lý nội dung của SangDupont (bật lửa S.T. Dupont vintage).
Dựa trên ảnh + tên sản phẩm "${name}", viết NHÁP mô tả bán hàng:
- desc_vi: 2-3 câu tiếng Việt — nhấn mạnh dáng, chất liệu, phong cách, giá trị vintage.
- desc_en: 2-3 câu tiếng Anh tương ứng.
KHÔNG bịa thông số cụ thể (năm, số lượng mạ), KHÔNG đề cập giá.
Trả về JSON đúng format: {"desc_vi": "...", "desc_en": "..."}`;

const TRANSLATE_PROMPT = `Bạn là phiên dịch chuyên ngành bật lửa cao cấp S.T. Dupont.
Dịch tên sản phẩm từ tiếng Việt sang tiếng Anh. Giữ nguyên thuật ngữ thương hiệu (Ligne 1/2, Guilloché, Diamond Head...), dịch phần mô tả (màu sắc, chất liệu, kiểu dáng) sang tiếng Anh tự nhiên.
Trả về CHỈ chuỗi tên tiếng Anh — không giải thích, không thêm gì khác.`;

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
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

    let body: { image_b64?: string; mode?: string; name?: string };
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "JSON không hợp lệ" }, 400);
    }
    const imageB64 = String(body.image_b64 || "");
    // translate không cần ảnh
    if (body.mode !== "translate") {
      if (!imageB64) return json({ ok: false, error: "Thiếu ảnh (image_b64)" }, 400);
      // ước lượng kích thước base64 → bytes (xấp xỉ 3/4)
      if ((imageB64.length * 3) / 4 > MAX_IMG_BYTES + 4096) {
        return json({ ok: false, error: "Ảnh quá lớn (tối đa 1.5MB)" }, 400);
      }
    }

    const ip = clientIp(req);
    const { count } = await supabase
      .from("ai_chat_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 3600_000).toISOString())
      .eq("ip", ip);
    if ((count || 0) >= RATE_LIMIT_PER_HOUR) {
      return json({ ok: false, error: "Thử lại sau 1 giờ" }, 429);
    }

    const mode = body.mode === "draft" ? "draft" : body.mode === "translate" ? "translate" : "intake";
    const name = String(body.name || "").slice(0, 200);
    const text = String(body.text || "").slice(0, 300);
    let userPrompt = INTAKE_PROMPT;
    if (mode === "draft") userPrompt = DRAFT_PROMPT(name);
    if (mode === "translate") {
      if (!text) return json({ ok: false, error: "Thiếu text" }, 400);
      userPrompt = `${TRANSLATE_PROMPT}\nTên tiếng Việt: "${text}"`;
    }

    const apiKey = Deno.env.get("AI_API_KEY") || "";
    const baseUrl = Deno.env.get("AI_BASE_URL") || "https://opencode.ai/zen/go/v1";
    const model = Deno.env.get("AI_VISION_MODEL") || "qwen3.7-plus";

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      const payload: Record<string, unknown> = {
        model,
        messages: [
          { role: "user", content: [{ type: "text", text: userPrompt }] },
        ],
        max_tokens: 500,
      };
      if (mode !== "translate") {
        (payload.messages[0].content as unknown[]).push({
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${imageB64}` },
        });
      }
      res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
    } catch (e) {
      clearTimeout(t);
      const msg = (e as Error).message || String(e);
      console.error("vision upstream error:", msg);
      await supabase.from("ai_chat_logs").insert({
        prompt_hash: "vision-" + (mode === "draft" ? "draft" : "intake") + "-err",
        ip,
        status: 502,
        tokens: 0,
        response_preview: msg.slice(0, 100),
      });
      return json({ ok: false, error: "Dịch vụ tạm lỗi — thử lại" }, 502);
    }
    clearTimeout(t);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      await supabase.from("ai_chat_logs").insert({
        prompt_hash: "vision-" + (mode === "draft" ? "draft" : "intake"),
        ip,
        status: res.status,
        tokens: 0,
        response_preview: errBody.slice(0, 100),
      });
      return json({ ok: false, error: "Dịch vụ tạm lỗi — thử lại" }, 502);
    }

    const data = await res.json();
    const content = String(data.choices?.[0]?.message?.content || "").trim();
    const tokens = data.usage?.total_tokens || 0;

    await supabase.from("ai_chat_logs").insert({
      prompt_hash: "vision-" + (mode === "draft" ? "draft" : "intake"),
      ip,
      status: 200,
      tokens,
      response_preview: content.slice(0, 120),
    });

    if (!content) return json({ ok: false, error: "Trả lời trống" }, 502);

    if (mode === "draft") {
      // cố parse JSON {desc_vi, desc_en}, fallback text
      try {
        const parsed = JSON.parse(content);
        if (parsed.desc_vi || parsed.desc_en) {
          return json({ ok: true, draft: { desc_vi: parsed.desc_vi || "", desc_en: parsed.desc_en || "" } });
        }
      } catch { /* fallback */ }
      return json({ ok: true, draft: { desc_vi: content, desc_en: "" } });
    }

    if (mode === "translate") {
      // bỏ dấu ngoặc kép thừa nếu model wrap
      return json({ ok: true, translated: content.replace(/^["']|["']$/g, "").trim() }, 200);
    }

    return json({ ok: true, summary: content, missing_angles: [] }, 200);
  },
};
