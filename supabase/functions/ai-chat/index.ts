// ai-chat — AI Concierge: chat tư vấn sản phẩm (P8T02)
// Provider: opencode-go (https://opencode.ai/zen/go/v1) model deepseek-v4-flash
// Secrets: AI_API_KEY (OPENCODE_GO_API_KEY), AI_ENABLED, AI_MODEL, AI_BASE_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://sangdupont.vercel.app";
const RATE_LIMIT_PER_HOUR = 30;
const COST_CAP_PER_DAY = 100; // số request/ngày
const MAX_TOKENS = 800;
const TIMEOUT_MS = 20_000;

const SYSTEM_PROMPT = `BẠN LÀ NHÂN VIÊN BÁN HÀNG CỦA SANGDUPONT — shop bật lửa S.T. Dupont vintage chính hãng (Sang Van Collection, TP.HCM). Khách nói tiếng Anh → trả lời tiếng Anh (giọng tương tự, xưng hô tự nhiên).

## CÁ TÍNH
- Tận tâm, chuyên nghiệp, yêu sản phẩm, tự tin như người sành hàng 10 năm.
- Xưng hô: khách = "anh" (trẻ có thể "bạn"), mình = "em". Giọng ấm, tự nhiên, chân thành — KHÔNG máy móc, KHÔNG lặp khuôn.
- Dùng tối thiểu emoji (😊 ✨) và dấu ~ cho thân thiện — KHÔNG lạm dụng.
- **KHÔNG dùng markdown** (không **, không *): viết text thường, xuống dòng gọn.
- Trả lời NGẮN: 2-4 câu, tối đa 6 câu. Không phun danh sách; chi tiết chỉ khi khách hỏi.
- Luôn kết bằng 1 câu hỏi/gợi ý hành động (bán hàng chủ động).

## QUY TRÌNH BÁN HÀNG
1. CHÀO + HỎI NHU CẦU: khách mới → chào + hỏi ngắn: dùng hay tặng? thích dòng nào? (đừng hỏi cùng lúc nhiều câu)
2. ĐOÁN Ý: tặng quà → gợi ý mẫu sang/đóng hộp đủ phụ kiện; dùng hằng ngày → dòng bền gọn; phân vân giá → trấn an "bên em nhiều phân khúc, anh để em gợi ý theo túi tiền".
3. GIỚI THIỆU ĐÚNG DATA: gọi search_products/get_product → chọn 2-3 mẫu hợp nhất. Nhấn điểm bán THẬT (dòng, chất liệu, tình trạng, phụ kiện). Thêm 1 câu kể chuyện ngắn về era/dòng nếu khách quan tâm (vd dòng Diamond Head 80s, guilloché thủ công) — làm sản phẩm sống động, vẫn KHÔNG bịa thông số.
4. CHỐT SALE: khách có ý mua ("bao nhiêu", "lấy được", "gửi đi đâu") → lấy tên + SĐT → gọi create_lead → báo mã + "bên em liên hệ trong ngày" + cảm ơn.
5. BẢO DƯỠNG: hỏi kỹ triệu chứng (yếu lửa/không bắt/kêu đá?), hướng dẫn gửi ảnh + mô tả qua form hoặc gọi 0905 076 886.
6. TÌM THEO TIÊU CHÍ: khách đưa điều kiện (dòng/giá/chất liệu/phong cách) → gọi tool recommend và CHỈ giới thiệu candidate trả về — không tự thêm/bớt sản phẩm.

## XỬ LÝ TÌNH HUỐNG
- Search không ra → nói thật "hiện không có mẫu này" + gợi ý mẫu tương tự có sẵn (tông màu/dòng gần nhất) + mời xem website.
- Khách hỏi BÚT Dupont → "shop em chuyên bật lửa vintage ạ — bên em không có bút trong kho hiện tại; anh cần tư vấn bật lửa thì em hỗ trợ ngay nè" (không bịa bút).
- Khách đòi giá lần 2, sốt ruột → giữ bình tĩnh: "em hiểu anh muốn biết giá sớm — để em ghi nhận, chủ shop báo giá tốt nhất ngay trong ngày ạ" + vẫn lấy lead. KHÔNG tự đưa con số.
- Khách hỏi thật/giả → trấn an kiểm định kỹ trước khi lên kệ + chi tiết giám định do chủ shop trao đổi trực tiếp (0905 076 886). KHÔNG khẳng định thật/giả.
- Khách muốn gặp người thật → đưa 0905 076 886 (Zalo/Telegram @sangdupontbot), không cố giữ.
- Ngoài phạm vi (chính trị/tin tức/code...) → lịch sự quay về sản phẩm.

## BỔ SUNG THÔNG TIN CHO YÊU CẦU (khi có mã yêu cầu)
- Khi khách nói kèm mã yêu cầu (vd "#abc12345") hoặc đang bổ sung thông tin cho yêu cầu đã gửi (dòng quan tâm, nhu cầu chi tiết, ghi chú) → gọi tool **update_lead** với request_code + thông tin mới (need / line_interest / note).
- Sau khi cập nhật thành công → xác nhận thân thiện: "Dạ em đã ghi chú thêm vào yêu cầu #xxx rồi ạ — chủ shop sẽ nắm đủ thông tin để tư vấn chuẩn nhất 😊" (ngắn gọn).
- Nếu tool báo lỗi (không tìm thấy mã) → nói nhẹ: "dạ để em kiểm tra lại với chủ shop ạ" — không tự sửa.

## CHÍNH SÁCH (KHÔNG tự đưa — dẫn chủ shop)
- Thanh toán (COD/chuyển khoản/cọc), đổi trả, giờ liên hệ, mua sỉ/đại lý → "em không tự quyết được, để em ghi nhận, chủ shop xác nhận chính xác ạ" + lấy SĐT hoặc đưa 0905 076 886. KHÔNG bịa điều khoản.
- Giá trị sưu tầm/đầu tư ("lên giá không?") → không hứa hẹn tăng giá: "dòng vintage được giới sưu tầm quan tâm, nhưng giá trị thay đổi theo thị trường — anh tham khảo chủ shop nhé".
- Lịch sử thương hiệu → chỉ nói kiến thức chung đúng (S.T. Dupont thương hiệu Pháp, Ligne 1/2 dòng bật lửa kinh điển) — KHÔNG bịa năm tháng/con số cụ thể nếu không chắc.
- Khách hỏi mẫu không thấy trong search → có thể đang hết hoặc đang giữ chỗ: "để em kiểm tra với chủ shop — anh để lại SĐT, bên em xác nhận trong ngày nhé".

## GIỚI HẠN CỨNG
- Giá null → "giá đang cập nhật, em xác nhận với chủ shop rồi báo anh chính xác" + lấy SĐT. TUYỆT ĐỐI không tự báo con số.
- KHÔNG bịa sản phẩm/giá/tồn kho/tình trạng — chỉ nói từ dữ liệu tool.
- KHÔNG cam kết bảo hành/thời gian sửa cụ thể — "có hỗ trợ bảo dưỡng, chi tiết trao đổi trực tiếp".

## VÍ DỤ GIỌNG (tham khảo, không copy y hệt)
- "có gì đẹp không?" → "Dạ bên em đang có mấy mẫu Ligne 1 với Ligne 2 rất đáng chú ý anh ơi~ Anh đang tìm để dùng hay tặng quà ạ? Em gợi ý đúng gu cho anh."
- "bao nhiêu tiền?" (null) → "Dạ mẫu này em chưa tiện báo giá ngay trên tin nhắn ạ — để em ghi nhận thông tin, chủ shop sẽ báo giá tốt nhất và tư vấn kỹ hơn. Anh cho em xin SĐT nha~"
- "lấy liền được không?" → "Dạ được ạ! Anh cho em xin tên với SĐT, bên em liên hệ xác nhận trong ngày, sẵn tiện tư vấn mẫu hợp nhất với anh 😊"`;

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

function hash(s: string): string {
  // hash nhẹ (djb2) — chỉ để đếm usage, không phải bảo mật
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

export default {
  fetch: async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

    // Kill switch
    if (Deno.env.get("AI_ENABLED") !== "true") {
      return json({ ok: false, error: "Trợ lý tạm tắt — liên hệ qua Telegram/Zalo" }, 503);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let body: { message?: string };
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "JSON không hợp lệ" }, 400);
    }
    const message = String(body.message || "").trim().slice(0, 1000);
    if (!message) return json({ ok: false, error: "Vui lòng nhập câu hỏi" }, 400);
    // UI gửi lang (vi/en) — buộc ngôn ngữ trả lời khi trang EN
    const uiLang = body.lang === "en" ? "en" : "vi";
    if (uiLang === "en") {
      message = message + " (Please reply in English)";
    }
    // Mã yêu cầu (khách bổ sung thông tin cho lead đã gửi qua form)
    const requestCode = String(body.request_code || "").trim().slice(0, 8);
    if (requestCode) {
      message = `[Yêu cầu #${requestCode}] ${message} — khách đang bổ sung thông tin cho yêu cầu này, dùng update_lead nếu có thông tin mới (dòng quan tâm/nhu cầu/ghi chú).`;
    }

    const ip = clientIp(req);

    // Rate limit 20/h/IP
    const { count: hourCount } = await supabase
      .from("ai_chat_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 3600_000).toISOString())
      .eq("ip", ip);
    if ((hourCount || 0) >= RATE_LIMIT_PER_HOUR) {
      return json({ ok: false, error: "Bạn đã hỏi quá nhiều — thử lại sau 1 giờ" }, 429);
    }

    // Cost cap/ngày
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { count: dayCount } = await supabase
      .from("ai_chat_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay.toISOString());
    if ((dayCount || 0) >= COST_CAP_PER_DAY) {
      return json({ ok: false, error: "Đã hết lượt tư vấn hôm nay — liên hệ người thật" }, 429);
    }

    // Tools
    const tools = [
      {
        type: "function",
        function: {
          name: "search_products",
          description: "Tìm sản phẩm theo từ khóa (tên/dòng). Trả danh sách sản phẩm available.",
          parameters: {
            type: "object",
            properties: { keyword: { type: "string", description: "Từ khóa tìm (slug/tên/dòng)" } },
            required: ["keyword"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_product",
          description: "Lấy chi tiết 1 sản phẩm theo slug (kèm ảnh).",
          parameters: {
            type: "object",
            properties: { slug: { type: "string" } },
            required: ["slug"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_lead",
          description: "Ghi nhận lead (khách muốn mua/bảo dưỡng/tư vấn sâu). Cần tên + số điện thoại + nhu cầu.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string" },
              phone: { type: "string" },
              need: { type: "string" },
            },
            required: ["name", "phone", "need"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "update_lead",
          description: "Cập nhật thông tin bổ sung cho yêu cầu đã gửi (bằng mã yêu cầu 8 ký tự): dòng quan tâm, nhu cầu chi tiết, hoặc ghi chú thêm. Chỉ dùng khi khách đang bổ sung thông tin cho yêu cầu có mã.",
          parameters: {
            type: "object",
            properties: {
              request_code: { type: "string", description: "Mã yêu cầu 8 ký tự (vd abc12345)" },
              need: { type: "string", description: "Nhu cầu chi tiết mới — tùy chọn" },
              line_interest: { type: "string", description: "Dòng quan tâm mới (vd Ligne 1, Ligne 2) — tùy chọn" },
              note: { type: "string", description: "Ghi chú bổ sung ngắn — tùy chọn" },
            },
            required: ["request_code"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "recommend",
          description: "Gợi ý sản phẩm theo tiêu chí khách đưa (dòng/ chất liệu/ màu/ ngân sách). LUÔN dùng tool này khi khách tìm theo tiêu chí; chỉ giới thiệu sản phẩm tool trả về.",
          parameters: {
            type: "object",
            properties: {
              line: { type: "string", description: "Dòng (vd Ligne 1, Ligne 2) — tùy chọn" },
              material: { type: "string", description: "Chất liệu/tông màu (vd vàng, đen, sơn mài) — tùy chọn" },
              budget_max: { type: "number", description: "Ngân sách tối đa (VND) — tùy chọn" },
              style: { type: "string", description: "Phong cách (gọn/cổ điển/sang...) — tùy chọn" },
            },
          },
        },
      },
    ];

    const callTool = async (name: string, args: Record<string, unknown>) => {
      if (name === "search_products") {
        const kw = String(args.keyword || "").trim();
        const { data } = await supabase
          .from("products")
          .select("slug, name_vi, name_en, line, status, price")
          .eq("status", "available")
          .or(`name_vi.ilike.%${kw}%,name_en.ilike.%${kw}%,line.ilike.%${kw}%,slug.ilike.%${kw}%`)
          .limit(5);
        return JSON.stringify(data || []);
      }
      if (name === "get_product") {
        const slug = String(args.slug || "");
        const { data } = await supabase
          .from("products")
          .select("*, product_media(url, kind, sort_order)")
          .eq("slug", slug)
          .eq("status", "available")
          .maybeSingle();
        return JSON.stringify(data || null);
      }
      if (name === "recommend") {
        // Deterministic filter — chọn candidate chính xác, AI chỉ giới thiệu
        const line = String(args.line || "").trim();
        const material = String(args.material || "").trim();
        const budgetMax = Number(args.budget_max) > 0 ? Number(args.budget_max) : null;
        const style = String(args.style || "").trim().toLowerCase();

        let q = supabase
          .from("products")
          .select("slug, name_vi, name_en, line, material, status, price, price_unit")
          .eq("status", "available");
        if (line) q = q.eq("line", line);
        if (material) q = q.or(`material.ilike.%${material}%,name_vi.ilike.%${material}%,name_en.ilike.%${material}%`);
        if (budgetMax) q = q.lte("price", budgetMax);
        const { data } = await q.limit(5);

        let candidates = data || [];
        // Lọc thêm theo style nếu có (từ khóa trong name/line/material)
        if (style) {
          const styleKw = style.includes("gọn") ? ["ligne 1", "ligne1", "guilloch"] : style.includes("sang") || style.includes("cao cấp") ? ["ligne 2", "diamond", "gold"] : [];
          if (styleKw.length > 0) {
            const kw = styleKw.join("|");
            candidates = candidates.filter((p: Record<string, unknown>) =>
              new RegExp(kw, "i").test(`${p.line} ${p.name_vi} ${p.name_en} ${p.material}`)
            );
          }
          if (candidates.length === 0) candidates = data || [];
        }
        return JSON.stringify(candidates.slice(0, 3));
      }
      if (name === "create_lead") {
        const name = String(args.name || "").trim().slice(0, 200);
        const phone = String(args.phone || "").trim();
        const need = String(args.need || "").trim().slice(0, 500);
        if (!name || !/^[0-9+\s-]{8,15}$/.test(phone)) {
          return JSON.stringify({ ok: false, error: "Cần tên hợp lệ + số điện thoại 8-15 số" });
        }
        const { data: lead, error } = await supabase
          .from("leads")
          .insert({ type: "buy", name, phone, need: need || null, channel: "ai_chat", status: "new", meta: { source: "ai_chat", ip } })
          .select("id")
          .single();
        if (error || !lead) return JSON.stringify({ ok: false, error: "Lưu lead lỗi" });
        // Telegram notify
        const token = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
        const chatId = Deno.env.get("TELEGRAM_CHAT_ID") || "";
        try {
          if (token && chatId) {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: Number(chatId),
                text: `🔔 Lead mới — AI CHAT\n👤 <b>${name}</b>\n📞 ${phone}\n📝 ${need || "-"}\n#${lead.id.slice(0, 8)}`,
                parse_mode: "HTML",
              }),
            });
          }
        } catch { /* không fail chính */ }
        return JSON.stringify({ ok: true, lead_id: lead.id, request_code: lead.id.slice(0, 8) });
      }
      if (name === "update_lead") {
        const code = String(args.request_code || "").trim().slice(0, 8);
        if (!/^[0-9a-f]{8}$/i.test(code)) return JSON.stringify({ ok: false, error: "Mã yêu cầu không hợp lệ" });
        const need = args.need ? String(args.need).trim().slice(0, 500) : null;
        const lineInterest = args.line_interest ? String(args.line_interest).trim().slice(0, 200) : null;
        const note = args.note ? String(args.note).trim().slice(0, 500) : null;
        if (!need && !lineInterest && !note) {
          return JSON.stringify({ ok: false, error: "Chưa có thông tin mới để cập nhật" });
        }
        // Tìm lead theo 8 ký tự đầu id
        const { data: lead, error: findErr } = await supabase
          .from("leads")
          .select("id, meta")
          .filter("id::text", "like", `${code}%`)
          .maybeSingle();
        if (findErr || !lead) return JSON.stringify({ ok: false, error: "Không tìm thấy yêu cầu" });
        const oldMeta = (lead.meta && typeof lead.meta === "object" ? lead.meta : {}) as Record<string, unknown>;
        const notes: unknown[] = Array.isArray(oldMeta.ai_notes) ? oldMeta.ai_notes : [];
        if (note) {
          notes.push({ at: new Date().toISOString(), text: note, source: "chat_widget" });
        }
        const { error: updErr } = await supabase
          .from("leads")
          .update({
            ...(need !== null ? { need } : {}),
            ...(lineInterest !== null ? { line_interest: lineInterest } : {}),
            meta: { ...oldMeta, ai_notes: notes },
          })
          .filter("id::text", "like", `${code}%`);
        if (updErr) return JSON.stringify({ ok: false, error: `Cập nhật lỗi: ${updErr.message}` });
        return JSON.stringify({ ok: true, request_code: code });
      }
      return JSON.stringify({ error: "tool không tồn tại" });
    };

    // Vòng lặp tool calling (tối đa 3 vòng)
    const apiKey = Deno.env.get("AI_API_KEY") || "";
    const baseUrl = Deno.env.get("AI_BASE_URL") || "https://opencode.ai/zen/go/v1";
    const model = Deno.env.get("AI_MODEL") || "deepseek-v4-flash";
    let messages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ];
    let finalText = "";
    let usedTokens = 0;
    let ok = false;
    let lastToolSummary = ""; // fallback deterministic khi model trả content rỗng (pitfall deepseek tool-calling)

    for (let round = 0; round < 3; round++) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages, tools, tool_choice: "auto", max_tokens: MAX_TOKENS }),
          signal: ctrl.signal,
        });
      } catch (e) {
        clearTimeout(t);
        await supabase.from("ai_chat_logs").insert({ prompt_hash: hash(message), ip, status: 502, tokens: 0, response_preview: "upstream error" });
        return json({ ok: false, error: "Trợ lý tạm lỗi — thử lại sau" }, 502);
      }
      clearTimeout(t);
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        await supabase.from("ai_chat_logs").insert({ prompt_hash: hash(message), ip, status: res.status, tokens: 0, response_preview: errBody.slice(0, 100) });
        return json({ ok: false, error: "Trợ lý tạm lỗi — thử lại sau" }, 502);
      }
      const data = await res.json();
      usedTokens = data.usage?.total_tokens || 0;
      const choice = data.choices?.[0];
      if (!choice) return json({ ok: false, error: "Phản hồi trống" }, 502);

      if (choice.finish_reason === "tool_calls" && choice.message?.tool_calls?.length) {
        messages.push(choice.message);
        for (const tc of choice.message.tool_calls) {
          let args: Record<string, unknown> = {};
          try { args = JSON.parse(tc.function.arguments || "{}"); } catch { args = {}; }
          const toolResult = await callTool(tc.function.name, args);
          // Ghi summary fallback (nội dung thật từ tool — viết giọng bán hàng, không data dump)
          if (tc.function.name === "search_products") {
            try {
              const rows = JSON.parse(toolResult);
              if (Array.isArray(rows) && rows.length > 0) {
                const lines = rows.map((r: Record<string, unknown>) => {
                  const avail = r.status === "available" ? "còn hàng" : "hết hàng";
                  const price = r.price ? `${r.price} ${r.price_unit || ""}` : null;
                  return `- ${r.name_vi} (${r.line || "dòng vintage"}) — ${avail}${price ? ", " + price : ""}`;
                }).join("\n");
                lastToolSummary = `Dạ, bên em đang có mấy mẫu phù hợp nè:\n${lines}\n\nVề giá, để em xác nhận với chủ shop rồi báo anh chính xác nhất ạ. Anh/chị cho em xin SĐT để bên em liên hệ trong ngày nha 😊`;
              } else {
                lastToolSummary = "Rất tiếc, hiện bên em không có mẫu phù hợp ạ. Anh/chị có thể xem thêm bộ sưu tập trên website sangdupont.vercel.app, hoặc cho em biết anh đang tìm dòng nào — em gợi ý mẫu gần nhất nè~";
              }
            } catch { /* giữ nguyên */ }
          } else if (tc.function.name === "get_product" && !toolResult.includes('"error"')) {
            try {
              const p = JSON.parse(toolResult);
              if (p && p.name_vi) {
                const price = p.price ? `${p.price} ${p.price_unit || ""}` : "đang cập nhật — để em xác nhận với chủ shop rồi báo anh chính xác nhất ạ";
                const desc = p.desc_vi ? " " + p.desc_vi.slice(0, 200) : "";
                lastToolSummary = `Dạ, mẫu ${p.name_vi} (${p.line || "dòng vintage"}) bên em ${p.status === "available" ? "đang còn hàng" : "hiện đã hết"} ạ.${desc}\n\nGiá: ${price}. Anh/chị để lại SĐT để bên em liên hệ tư vấn thêm nha 😊`;
              }
            } catch { /* giữ nguyên */ }
          } else if (tc.function.name === "create_lead") {
            try {
              const r = JSON.parse(toolResult);
              if (r.ok) lastToolSummary = "Đã ghi nhận yêu cầu của bạn (mã #" + r.request_code + "). SangDupont sẽ liên hệ sớm nhất — cảm ơn bạn!";
            } catch { /* giữ nguyên */ }
          }
          messages.push({ role: "tool", content: toolResult, tool_call_id: tc.id } as never);
        }
        continue;
      }
      finalText = String(choice.message?.content || "").trim();
      ok = true;
      break;
    }

    if (!ok) {
      // Model trả content rỗng (pitfall tool-calling) → fallback deterministic từ tool data thật
      finalText = lastToolSummary ||
        "Xin lỗi, tôi chưa trả lời được — vui lòng liên hệ 0905 076 886 để được hỗ trợ trực tiếp.";
    }

    await supabase.from("ai_chat_logs").insert({
      prompt_hash: hash(message),
      ip,
      status: ok ? 200 : 500,
      tokens: usedTokens,
      response_preview: finalText.slice(0, 120),
    });

    return json({ ok: true, reply: finalText }, 200);
  },
};
