# TASKS — SangDupont WBS

> Quản lý bởi Mika. Runner KHÔNG được sửa file này.
> Format task chuẩn theo AGENTS.md `/plan2task` (8 fields). ID: `[#PxTzz]` (project nhỏ, không milestone).
> MASTERPLAN APPROVED 2026-08-14. **RELEASE A COMPLETE 2026-08-14 (Gate 10/10 PASS).**

## Phase 1: Foundation — ✅ DONE 2026-08-14
## Phase 2: Supabase Foundation — ✅ DONE 2026-08-14 (Reviewer PASS)
## Phase 3: Catalog + Product Detail — ✅ DONE 2026-08-14
## Phase 4: Admin/CMS — ✅ DONE 2026-08-14 (Reviewer PASS + verify production)
## Phase 5: Lead Pipeline + Telegram — ✅ DONE 2026-08-14 (Reviewer PASS + verify production)
## Phase 6: SEO + GA4 + Performance — ✅ DONE 2026-08-14 (Lighthouse mobile 94 / desktop 100)
## Phase 7: Release A Gate + Deploy Vercel — ✅ DONE 2026-08-14 (Gate 10/10 + tag v1.0-release-a)
_(chi tiết từng phase: `.ai/MASTER_PLAN.md`; task `[x]` đã prune theo RULE 3 sweep)_

### [#P7T06] Fix font tiếng Việt — load thật qua next/font/google (Playfair Display + Cormorant Garamond + Inter, subset vietnamese)

**Goal**: Sửa lỗi hiển thị font tiếng Việt vỡ (dấu tách rời/glyph thiếu — anh phát hiện 2026-08-14 trên production). CSS khai báo Playfair/Cormorant/Inter nhưng KHÔNG load → fallback hệ thống. Load qua `next/font/google` (tự host, subset latin+vietnamese, preload + font-display swap sẵn) — không tụt perf.

**Depends on**: `none` (fix post-Release A)
**Parallel-safe**: `no`

**Context hiện có**:
- `app/globals.css:13-15`: `--serif:'Playfair Display',...` / `--serif-2:'Cormorant Garamond',...` / `--sans:'Inter',...` — tên font nhưng không load → browser fallback Georgia/system → tiếng Việt vỡ
- `app/layout.tsx`: RootLayout không có font config; build PASS; Lighthouse hiện mobile 94/desktop 100

**Concrete changes** (Mika tự làm — cấu hình font tinh tế, runner dễ sai):
1. `app/layout.tsx`: import `{ Playfair_Display, Cormorant_Garamond, Inter }` từ `next/font/google`:
   - `const playfair = Playfair_Display({ subsets:["latin","vietnamese"], variable:"--font-serif", display:"swap" })`
   - `const cormorant = Cormorant_Garamond({ subsets:["latin","vietnamese"], variable:"--font-serif-2", weight:["400","500","600"], style:["normal","italic"], display:"swap" })`
   - `const inter = Inter({ subsets:["latin","vietnamese"], variable:"--font-sans", display:"swap" })`
   - RootLayout `<html className={\`${playfair.variable} ${cormorant.variable} ${inter.variable}\`} ...>` (giữ lang="vi" + metadata)
2. `app/globals.css`: 3 tokens → `--serif: var(--font-serif), 'Playfair Display', Georgia, serif;` / `--serif-2: var(--font-serif-2), 'Cormorant Garamond', Georgia, serif;` / `--sans: var(--font-sans), system-ui, sans-serif;`
3. Build + verify: HTML có preload font woff2 (self-host); Lighthouse lại ≥85/90
4. Browser CDP screenshot trang chủ → so ảnh text vàng serif ("DI SẢN / Của Lửa", "Sở hữu một phần lịch sử") — dấu tiếng Việt đúng

**Constraints**: 3 font Google miễn phí, hỗ trợ subset vietnamese đầy đủ (Playfair Display ✓ / Cormorant Garamond ✓ / Inter ✓); KHÔNG thêm @import/<link> Google Fonts (next/font tự host); KHÔNG đổi màu/weight/layout
**Definition of Done**: build PASS; preload woff2 trong HTML; Lighthouse ≥85/90; browser screenshot dấu tiếng Việt đúng (anh xác nhận); deploy production + commit

**Status**: `[x]` — verified 2026-08-14 (Mika): next/font/google self-host 3 font (subset vietnamese), browser CDP dấu tiếng Việt đúng + font premium; Lighthouse mobile 86/desktop 100 (tối ưu weight 600/400 italic/400-500, 17 files giảm từ 22); deploy production + anh xác nhận

## Phase 8: AI Concierge — Release B

### [#P8T01] `.ai/AI_POLICY.md` + chuẩn hóa data sản phẩm cho AI

**Goal**: Viết AI policy cứng (điều gì AI được/không được làm) + rà soát data sản phẩm đủ chuẩn để AI trả lời chính xác (desc VI/EN đầy đủ, không trống).

**Depends on**: `none`
**Parallel-safe**: `no`

**Context hiện có**: MASTER_PLAN Phase 8 "AI không được": bịa sản phẩm/giá/tồn kho, khẳng định thật/giả, tự chốt giá, cam kết bảo hành/thời gian sửa, tự sửa production data. 9 products (8 available + 1 reserved), một số desc có thể ngắn/thiếu.

**Concrete changes** (Mika):
1. Tạo `.ai/AI_POLICY.md` (ngắn, ≤100 dòng): 
   - Trích nguyên tắc Phase 8 + gate; policy cụ thể: AI chỉ trả lời dựa trên dữ liệu products thật (không bịa), trả "Liên hệ" khi thiếu giá, không xác nhận thật/giả, handoff khi khách muốn mua/tư vấn sâu, disclaimer 1 dòng
2. Query DB kiểm tra: products có `desc_vi IS NULL OR desc_en IS NULL` hoặc trống → liệt kê; nếu ≤3 sản phẩm thiếu → thêm desc ngắn gọn (2-3 câu, dựa trên tên/line thật, KHÔNG bịa thông số cụ thể); nếu nhiều hơn → báo anh
3. Commit policy + data fix

**Constraints**: KHÔNG bịa thông số/giá khi bổ sung desc (mô tả chung chung dựa trên loại sản phẩm)
**Definition of Done**: AI_POLICY.md tồn tại; mọi product available có desc VI+EN không trống; commit

**Status**: `[ ]`

---

### [#P8T02] Edge Function `ai-chat` — proxy AI + guard (cần anh cấp API key)

**Goal**: Edge Function `ai-chat`: nhận câu hỏi khách → gọi AI provider (secret env) với system prompt từ AI_POLICY → trả lời; guard: rate limit 20/h/IP, token cap 800 mỗi lượt, timeout 20s, log usage, cost cap (số request/ngày), kill switch (env ENABLED=false → 503).

**Depends on**: `[#P8T01]` (policy làm system prompt)
**Parallel-safe**: `no`

**Context hiện có**: Edge Function create-lead đã có pattern (CORS, secrets, rate limit qua meta ip); AI provider cần anh cấp API key (hỏi anh dùng provider nào — OpenAI/Gemini/xAI/deepseek; key đặt qua `supabase secrets set`)

**Concrete changes** (Mika viết — Deno, nhạy cảm secrets):
1. `supabase functions new ai-chat` → index.ts:
   - CORS + POST only + rate limit 20/h/IP (dùng bảng ai_chat_log hoặc meta — tạo migration nhỏ bảng `ai_chat_logs` (id, prompt_hash, response_preview, ip, created_at, tokens) — vừa log usage vừa rate limit)
   - System prompt: đọc AI_POLICY nội dung (nhúng vào env hoặc hardcode 1 bản ngắn trong code + policy đầy đủ ở .ai)
   - Tools: search_products(slug|keyword) → supabase select products available; get_product(slug) → chi tiết + media; create_lead(name, phone, need) → insert leads + Telegram notify (tái dùng pattern create-lead)
   - AI call: fetch provider API (chat completions), token cap, timeout AbortController
   - Kill switch: `if (Deno.env.get('AI_ENABLED') !== 'true') return 503`
   - Cost cap: đếm requests hôm nay (bảng ai_chat_logs, created_at > now() start of day) ≥ cap → 429 "Hết lượt tư vấn hôm nay"
3. Migration bảng `ai_chat_logs`
4. Deploy + test curl: hỏi "bật lửa L2 giá bao nhiêu?" → trả lời dựa data thật; hỏi "có hàng không?" → đúng status

**Constraints**: Secret KHÔNG commit (env chỉ); KHÔNG cho AI tool khác ngoài 3 tools; response không chứa PII khách
**Definition of Done**: deploy OK; curl test: câu hỏi về sản phẩm có → trả lời đúng dữ liệu; hỏi giá khi price NULL → "Liên hệ"; request thứ 21 → 429; AI_ENABLED=false → 503

**Status**: `[ ]`

---

### [#P8T03] AI chat UI trên website (chat bubble + panel)

**Goal**: Khung chat nổi góc phải dưới (như chat widget): khách gõ → gọi `ai-chat` → hiện câu trả lời; nút "Chat với người thật" → t.me/sangdupontbot (handoff); disclaimer nhỏ "AI trả lời dựa trên dữ liệu sản phẩm — liên hệ người thật để chốt".

**Depends on**: `[#P8T02]` (function deploy xong)
**Parallel-safe**: `no`

**Context hiện có**: LeadForm đã có pattern fetch Edge Function + anon key; chat button hiện có `chat-fab` (Telegram) trong Hero — KHÔNG đụng (giữ Telegram fab), thêm widget riêng góc phải dưới

**Concrete changes** (dispatch runner agy — UI):
1. `components/AiChat.tsx` ("use client"): bubble nổi (fixed bottom-right, icon 💬, expand → panel 360×480 nền #101014 border vàng); messages list (user right / AI left); input + send; loading state "đang trả lời…"; gọi fetch `ai-chat` (anon key); error → "Tạm thời không liên hệ được — thử lại"; nút "Chat người thật" → https://t.me/sangdupontbot; disclaimer nhỏ dưới input
2. Wire vào `app/page.tsx` (render cuối body)
3. KHÔNG lưu lịch sử chat (session state only)

**Constraints**: KHÔNG PII trong prompt lưu log (chỉ prompt_hash); KHÔNG innerHTML; widget ẩn trên mobile? KHÔNG — vẫn hiện nhưng nhỏ (nút 48px)
**Definition of Done**: build PASS; browser verify (Mika): mở widget → hỏi "có L2 không?" → nhận câu trả lời từ AI; console NO_JS_ERRORS; nút handoff đúng link

**Status**: `[ ]`

---

### [#P8T04] Hermes `sangbot` restricted — product lookup + handoff (Telegram)

**Goal**: Cấu hình profile Hermes `sangbot` (đang chạy) thành concierge bán hàng restricted: chỉ đọc sản phẩm (Supabase read-only qua RLS public), FAQ/dịch vụ, tạo lead + handoff; KHÔNG shell/filesystem/web tự do.

**Depends on**: `[#P8T01]` (policy)
**Parallel-safe**: `no`

**Context hiện có**: profile `/home/pi5/.hermes/profiles/sangbot/` đang chạy gateway Telegram bot `sangdupontbot` (chat_id 6903033581); RLS: products public read available; leads chỉ is_admin

**Concrete changes** (Mika — cấu hình profile, đọc trước khi sửa):
1. Đọc `sangbot/SOUL.md` + `config.yaml` + skills hiện có → đánh giá quyền hiện tại
2. Ghi SOUL.md (hoặc skill) hướng dẫn: chỉ dùng tool đọc products (Supabase read), trả lời theo AI_POLICY, create lead khi khách muốn mua, handoff nói "liên hệ 0905 076 886 / gửi Zalo" — KHÔNG tự ý làm việc khác
3. Verify: nhắn bot "bật lửa L2 có không?" → trả lời dựa data; nhắn "giá bao nhiêu" → policy (Liên hệ nếu null); KHÔNG thấy tool nguy hiểm được gọi

**Constraints**: KHÔNG mở rộng quyền (chỉ hạn chế); KHÔNG sửa core Hermes — chỉ profile sangbot
**Definition of Done**: bot trả lời đúng 3 câu test (có sản phẩm / giá null / handoff); log không thấy shell/web tự do

**Status**: `[ ]`

---

### [#P8T05] Eval + handoff end-to-end + gate + sweep

**Goal**: Chạy eval cố định (5 câu mẫu), verify handoff đầy đủ (AI → lead → Telegram → admin xem), chốt gate Phase 8, sweep.

**Depends on**: `[#P8T02]` + `[#P8T03]` + `[#P8T04]`
**Parallel-safe**: `no`

**Concrete changes** (Mika):
1. Eval 5 câu mẫu qua curl (ai-chat): sản phẩm có / sản phẩm không tồn tại / giá null / bảo dưỡng hỏi / chào mời chung — đối chiếu policy (không bịa, không khẳng định thật/giả)
2. Handoff E2E: AI create lead (qua tool) → DB lead mới + Telegram anh nhận → admin /admin/leads thấy → đổi status
3. Cost cap test: set cap nhỏ tạm → vượt → 429 → reset
4. Gate Phase 8 (MASTER_PLAN): 4 tiêu chí — không giới thiệu sp không tồn tại ✅ / policy hoạt động ✅ / handoff E2E PASS ✅ / cost cap ✅ → ghi kết quả
5. Sweep: MASTER_PLAN Phase 8 DONE + prune tasks + commit

**Constraints**: Test data dọn sạch; ghi số thật
**Definition of Done**: eval 5/5 đúng policy; handoff E2E PASS; gate 4/4; sweep xong

**Status**: `[ ]`

---

## Phase 9: Full AI — nội bộ + Vision + Research
_(chưa băm task — gated: chờ ROI Release B)_
