# TASKS — SangDupont WBS

> Quản lý bởi Mika. Runner KHÔNG được sửa file này.
> Format task chuẩn theo AGENTS.md `/plan2task` (8 fields). ID: `[#PxTzz]` (project nhỏ, không milestone).
> MASTERPLAN APPROVED 2026-08-14. **RELEASE A COMPLETE 2026-08-14 (Gate 10/10). RELEASE B COMPLETE 2026-08-14 (Gate 4/4).**

## Phase 1: Foundation — ✅ DONE 2026-08-14
## Phase 2: Supabase Foundation — ✅ DONE 2026-08-14 (Reviewer PASS)
## Phase 3: Catalog + Product Detail — ✅ DONE 2026-08-14
## Phase 4: Admin/CMS — ✅ DONE 2026-08-14 (Reviewer PASS + verify production)
## Phase 5: Lead Pipeline + Telegram — ✅ DONE 2026-08-14 (Reviewer PASS + verify production)
## Phase 6: SEO + GA4 + Performance — ✅ DONE 2026-08-14 (Lighthouse mobile 94 / desktop 100)
## Phase 7: Release A Gate + Deploy Vercel — ✅ DONE 2026-08-14 (Gate 10/10 + tag v1.0-release-a)
## Phase 8: AI Concierge — Release B — ✅ DONE 2026-08-14 (Gate 4/4: eval 5/5, policy, handoff E2E, cost cap)
_(chi tiết từng phase: `.ai/MASTER_PLAN.md`; task `[x]` đã prune theo RULE 3 sweep)_

## Phase 9A: Ops hoàn thiện — ✅ DONE (tách 2026-08-14, D22) — chưa băm task
## Phase 9B: Full AI — Vision intake + Admin draft + Recommendation (Research để sau)

### [#P9T01] Edge Function `vision-intake` — AI mô tả ảnh bảo dưỡng (qwen3.8-max vision)

**Goal**: Edge Function nhận ảnh khách gửi (base64, ≤1.5MB) → gọi opencode-go `qwen3.8-max` (vision — verified 2026-08-14; gpt-5.6-luna text-only KHÔNG dùng được) → mô tả sơ bộ: vật phẩm gì, đủ góc chưa (thiếu góc nào), đặc điểm nổi bật, triệu chứng thấy được → trả JSON cho client + lưu vào lead khi submit.

**Depends on**: `none` (vision verified — bước 0 xong)
**Parallel-safe**: `no`

**Context hiện có**: ai-chat dùng opencode-go (`AI_API_KEY` secret); model vision đã verify: qwen3.8-max trả mô tả chuẩn (thiếu góc rõ ràng); LeadForm maintenance upload 3 ảnh base64 (P5T03); leads chưa có cột ai_summary

**Concrete changes** (Mika viết — Deno, secrets):
1. Migration: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_summary text;`
2. `supabase functions new vision-intake` → index.ts:
   - CORS (giống ai-chat) + POST + body {image_b64} (≤1.5MB) + rate limit 30/h/IP (bảng ai_chat_logs — thêm cột kind='vision' hoặc tái dùng với meta)
   - System prompt: "Mô tả sơ bộ ảnh bật lửa vintage: (1) vật phẩm/dáng gì, (2) ảnh đủ góc chưa + thiếu góc nào (khuyến nghị: toàn thân trước/sau, đáy, 2 bên, cơ chế đánh lửa), (3) đặc điểm/khuyết điểm thấy được (trầy, mạ bong, ố...), (4) KHÔNG xác nhận thật/giả, KHÔNG định giá, KHÔNG phán đoán thời gian sản xuất chính xác"
   - Gọi `{base}/chat/completions` model qwen3.8-max, content array text+image_url, max_tokens 400, timeout 25s
   - Trả {ok, summary, missing_angles: []} — parse JSON nếu model trả structured, fallback text
   - Secret: AI_API_KEY + AI_BASE_URL (đã có từ ai-chat) + AI_VISION_MODEL=qwen3.8-max
3. Deploy + test: gửi img_01.jpg → summary có thiếu góc; gửi ảnh giả (không phải bật lửa) → vẫn mô tả đúng nội dung

**Constraints**: KHÔNG lưu ảnh vào log (chỉ summary); KHÔNG xác nhận thật/giả; KHÔNG PII
**Definition of Done**: deploy OK; curl test 2 ảnh (bật lửa + khác) trả summary chuẩn; rate limit hoạt động

**Status**: `[ ]`

---

### [#P9T02] Wire vision vào form bảo dưỡng (LeadForm) — preview summary + lưu ai_summary

**Goal**: Khách upload ảnh (maintenance) → gọi vision-intake ngay → hiện "AI nhận xét sơ bộ" + lưu summary vào lead khi submit.

**Depends on**: `[#P9T01]`
**Parallel-safe**: `no`

**Context hiện có**: LeadForm.tsx (P5T03) — attachments base64 khi submit; cần chèn bước vision sau khi chọn ảnh (trước submit)

**Concrete changes** (dispatch runner agy — UI):
1. LeadForm maintenance: sau khi file được chọn (handleUploadImage hoặc state attachments) → với ảnh đầu tiên: gọi `vision-intake` (anon key) → hiện khối nhỏ "🤖 AI nhận xét: ..." (có loading + retry nếu lỗi — KHÔNG chặn submit nếu vision fail)
2. Khi submit: body thêm `ai_summary` (nếu có)
3. create-lead Edge Function: nhận `ai_summary` → lưu vào leads.ai_summary
4. KHÔNG lưu history; KHÔNG innerHTML

**Constraints**: Vision fail → form vẫn gửi được (không chặn lead); summary chỉ hiển thị text
**Definition of Done**: build PASS; browser verify: chọn ảnh → thấy AI nhận xét + submit → leads.ai_summary có data

**Status**: `[ ]`

---

### [#P9T03] AI admin draft — mô tả VI/EN từ ảnh (nút trong /admin/products)

**Goal**: Nút "Draft bằng AI" trong form sản phẩm admin: gửi ảnh cover + tên → AI tạo nháp mô tả VI/EN → điền vào textarea (anh sửa/duyệt trước save).

**Depends on**: `[#P9T01]` (dùng chung vision-intake hoặc function mở rộng tham số prompt)
**Parallel-safe**: `no`

**Context hiện có**: /admin/products/page.tsx form (P4T04) — có fields desc_vi/desc_en; vision-intake đã có pattern gọi qwen3.8-max

**Concrete changes** (Mika + runner):
1. Mở rộng vision-intake: nhận thêm `mode: "draft"` → prompt khác: "Viết mô tả bán hàng 2-3 câu tiếng Việt (và tiếng Anh) cho sản phẩm tên X dựa trên ảnh — nhấn mạnh dáng, chất liệu, phong cách; không bịa thông số/giá" → trả {desc_vi, desc_en}
2. Admin form: nút "✨ Draft mô tả bằng AI" cạnh desc_vi/desc_en → gọi vision-intake mode=draft với cover ảnh → điền vào 2 textarea → anh chỉnh + Lưu (vẫn cần lưu thủ công — AI chỉ tạo nháp)
3. Build + verify

**Constraints**: AI chỉ điền nháp — save vẫn do anh; KHÔNG tự publish
**Definition of Done**: build PASS; browser verify: bấm nút → 2 textarea điền mô tả VI/EN

**Status**: `[ ]`

---

### [#P9T04] Recommendation — deterministic filter + AI giới thiệu

**Goal**: Khách hỏi "tìm theo tiêu chí" → filter code chọn candidate chính xác → AI viết lời giới thiệu. Tích hợp vào ai-chat (tool `recommend`).

**Depends on**: `none` (dùng lib/catalog + ai-chat có sẵn)
**Parallel-safe**: `no`

**Context hiện có**: ai-chat có 3 tools; products có line/material/status/price; catalog nhỏ 8 mẫu

**Concrete changes** (Mika):
1. ai-chat thêm tool `recommend(criteria)` — criteria {line?, material?, budget_max?, color?}:
   - Deterministic: supabase query products available + filter từng field (line eq, material ilike, price <= budget_max) → candidates (tối đa 3)
   - Trả candidates JSON → AI chỉ viết giới thiệu
2. System prompt thêm 1 dòng: "Khách tìm theo tiêu chí → dùng recommend; chỉ giới thiệu candidate trả về"
3. Deploy + test: "bật lửa vàng, gọn, dưới 5 triệu" → candidates đúng + giới thiệu; "vàng dưới 2 triệu" → không có → nói thật + gợi ý

**Constraints**: AI KHÔNG tự thêm/bớt candidate ngoài list trả về
**Definition of Done**: test 3 case PASS (có kết quả / không kết quả / budget không có giá)

**Status**: `[ ]`

---

### [#P9T05] Eval 9B + gate + sweep

**Goal**: Verify toàn bộ 9B: vision intake 2 case, draft 1 case, recommend 3 case; gate 9B (file 1: upload/private PASS, disclaimer, human-review, cost/kill); sweep.

**Depends on**: `[#P9T01]`-`[#P9T04]`
**Parallel-safe**: `no`

**Concrete changes** (Mika):
1. Eval: vision 2 ảnh (bật lửa + ảnh lạ) → không xác nhận thật/giả; draft → nháp đúng chủ đề; recommend 3 case
2. Gate 9B ghi MASTER_PLAN: upload/private storage PASS (đã verify P5) + disclaimer + human-review (draft/summary chỉ nháp — lưu cột phụ, không tự publish) + cost cap (ai_chat_logs shared)
3. Sweep: MASTER_PLAN 9B DONE + prune + commit

**Constraints**: ghi số thật
**Definition of Done**: eval PASS + gate PASS + sweep

**Status**: `[ ]`

---

## Vận hành (post-release — không phải phase)
- GA4: code sẵn sàng — chờ anh cấp Measurement ID (G-XXXX) → set env Vercel + rebuild
- Backup: `scripts/db-backup.sh` chạy tay; keepalive cron T7/CN đa-project (kurabe + sangwebsite)
- Publish sản phẩm: /admin thêm/sửa → rebuild + deploy (`vercel --prod`)
- AI chat: kill switch = `supabase secrets set AI_ENABLED=false`; cost cap 100 req/ngày (đổi hằng số + redeploy)
