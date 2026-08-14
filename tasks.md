# TASKS — SangDupont WBS

> Quản lý bởi Mika. Runner KHÔNG được sửa file này.
> Format task chuẩn theo AGENTS.md `/plan2task` (8 fields). ID: `[#PxTzz]` (project nhỏ, không milestone).
> MASTERPLAN APPROVED 2026-08-14.

## Phase 1: Foundation — ✅ DONE 2026-08-14
## Phase 2: Supabase Foundation — ✅ DONE 2026-08-14 (Reviewer PASS SW-P2-MIGRATIONS-01)
## Phase 3: Catalog + Product Detail — ✅ DONE 2026-08-14
## Phase 4: Admin/CMS tối giản — ✅ DONE 2026-08-14 (Reviewer PASS SW-P4-ADMIN-01 + verify production end-to-end)
_(chi tiết từng phase: `.ai/MASTER_PLAN.md`; task `[x]` đã prune theo RULE 3 sweep)_

## Phase 5: Lead Pipeline + Telegram Edge Function

### [#P5T01] `supabase/functions/create-lead/index.ts` — Edge Function: lưu lead + Telegram + rate limit

**Goal**: Tạo Supabase Edge Function `create-lead` — nhận lead từ form (JSON), validate, rate limit theo IP, lưu vào bảng `leads` (service role), gửi Telegram notification, trả mã yêu cầu.

**Depends on**: `none` (schema leads đã có P2; bucket lead-attachments P2)
**Parallel-safe**: `no`

**Context hiện có**:
- Bảng `leads`: type (buy|maintenance), name, phone, budget, need, line_interest, channel, status (default new), meta jsonb, created_at
- `.tmp/telegram.env` (gitignored) chứa `TELEGRAM_BOT_TOKEN=8775417579:AAE3...`
- Project ref `iloaeaoojxdovedjtowt`; service role key trong `.env.local` (KHÔNG đưa vào code — Edge Function dùng env secret)
- CLI supabase 2.114 (lệnh: `supabase functions new`, `supabase functions deploy`)

**Concrete changes**:
1. `supabase functions new create-lead` (Deno + serve từ std)
2. Logic function:
   - CORS headers (site `https://sangdupont.vercel.app`, methods POST/OPTIONS)
   - Parse body: `{ type, name, phone, budget, need, line_interest, channel, meta? }`
   - Validate: type ∈ {buy, maintenance}; name/phone bắt buộc (trim, ≤200 chars); phone regex `^[0-9+\s-]{8,15}$`; budget/need ≤500 chars
   - **Rate limit**: dùng `x-forwarded-for` IP (hoặc `x-real-ip`) + bảng `lead_rate_limits` (ip text PK, count int, window_start timestamptz) — hoặc đơn giản: query leads `created_at > now() - interval '1 hour'` AND meta->>'ip' = ip, count ≥5 → 429. KHÔNG cần bảng mới (dùng meta ip) — chọn cách này (zero migration)
   - Insert lead: `{...valid, status: 'new', meta: {...meta, ip, source: 'web_form'}}` qua `supabase-js` (import từ `https://esm.sh/@supabase/supabase-js@2`) với `SUPABASE_SERVICE_ROLE_KEY` env
   - Telegram: `fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {method:'POST', body: JSON.stringify({chat_id: CHAT_ID, text: formatLead(lead), parse_mode:'HTML'})})` — chat_id = **ID Telegram của anh** (hỏi anh hoặc dùng getUpdates để lấy — Mika sẽ lấy qua API)
   - Trả `{ok:true, lead_id}` (201)
3. Env secrets: `supabase secrets set TELEGRAM_BOT_TOKEN=... SUPABASE_SERVICE_ROLE_KEY=...` (lệnh deploy sẽ set) — CHAT_ID cũng là secret
4. Deploy: `supabase functions deploy create-lead`

**Constraints**:
- Token/keys KHÔNG trong code — chỉ env secret; KHÔNG commit `.tmp/telegram.env`
- KHÔNG để service role key lộ client — client chỉ gọi function qua anon key + URL public
- Rate limit 5/giờ/IP; lỗi validate → 400 với message tiếng Việt

**Definition of Done**:
- `supabase functions deploy` thành công (URL: `https://iloaeaoojxdovedjtowt.supabase.co/functions/v1/create-lead`)
- curl test: POST hợp lệ → 201 + lead trong DB + Telegram nhận message; POST thiếu phone → 400; POST lần 6 trong giờ → 429
- Test data dọn sau verify

**Status**: `[x]` — verified 2026-08-14 (Mika): deploy OK; curl test 201 (lead + DB + Telegram nhận), 400 (thiếu phone), 429 (rate limit lần 5/giờ); test data đã dọn

---

### [#P5T02] `app/contact-form.tsx` + wire vào Contact — Form tư vấn mua (client → Edge Function)

**Goal**: Form "Tư vấn mua" trên section Contact (hoặc modal riêng): ngân sách, nhu cầu, dòng quan tâm, tên, ĐT/Zalo, kênh → gọi `create-lead` → success state + mã yêu cầu; không reload.

**Depends on**: `[#P5T01]` (function deploy xong)
**Parallel-safe**: `no`

**Context hiện có**:
- `components/Contact.tsx` (server) hiện chỉ có CTA links (tel/Telegram/Zalo/Messenger/TikTok) — chưa có form
- Edge Function URL: `https://iloaeaoojxdovedjtowt.supabase.co/functions/v1/create-lead` (anon key header)
- Client fetch từ browser → CORS đã xử lý trong function

**Concrete changes**:
1. `components/LeadForm.tsx` ("use client"): 
   - Fields: type select (Mua / Bảo dưỡng — default Mua), tên*, ĐT/Zalo*, ngân sách (select: <5tr/5-10/10-20/20-50/>50/Liên hệ khác), nhu cầu (textarea), dòng quan tâm (text, placeholder "Ligne 2, Gatsby..."), kênh (select: Zalo/Telegram/Call/Inbox FB)
   - Submit: fetch POST Edge Function (header apikey: anon key từ `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` — build-time inline OK cho public key; KHÔNG dùng service role)
   - States: idle → sending (nút disabled "Đang gửi…") → success (hiện "✅ Đã nhận — mã yêu cầu #XXXX" + nút gửi tiếp) / error (message từ response)
   - Validate client: tên + phone bắt buộc trước khi gửi
2. Wire vào `components/Contact.tsx`: thêm block form dưới CTA row (giữ visual parity — card nền #101014 border vàng, 2 cột trên desktop)

**Constraints**:
- KHÔNG dùng service role ở client; KHÔNG innerHTML; không reload (fetch + state)
- KHÔNG sửa file khác ngoài Contact.tsx + file mới

**Definition of Done**:
- Build PASS; browser verify (Mika): điền form → submit → success "mã yêu cầu"; DB có lead mới; Telegram nhận
- Client validation: submit trống tên → lỗi inline không gọi API

**Status**: `[ ]`

---

### [#P5T03] Form bảo dưỡng + upload ảnh private (lead-attachments)

**Goal**: Tab/type "Bảo dưỡng" trong LeadForm: mô tả vấn đề + upload 1-3 ảnh (private bucket) + consent → lead kèm attachment; ảnh private chỉ admin xem (đã có RLS).

**Depends on**: `[#P5T01]` + `[#P5T02]` (cùng form)
**Parallel-safe**: `no`

**Context hiện có**:
- Bucket `lead-attachments` (private, admin-only — P2T04 verified)
- Bảng `lead_attachments`: lead_id FK, storage_path, storage_bucket default 'lead-attachments'
- Static export: upload qua client supabase storage cần signed upload hoặc... **KHÔNG** — client anon KHÔNG upload được vào private bucket (RLS is_admin) → cần cơ chế khác

**Concrete changes** (giải pháp: upload qua Edge Function — mở rộng create-lead hoặc function riêng):
1. Mở rộng `create-lead` (hoặc thêm `upload-lead-attachment`): nhận multipart hoặc base64 (≤3 ảnh, ≤2MB/ảnh) → lưu Storage `lead-attachments/<lead_id>/<ts>.<ext>` bằng service role (bypass RLS đúng cách server-side) → insert `lead_attachments` → trả URL path
2. LeadForm khi type=maintenance: hiện textarea mô tả vấn đề + input file (multiple accept image/*, ≤3) + consent checkbox ("Tôi đồng ý xử lý dữ liệu") — consent bắt buộc
3. Flow submit: tạo lead trước (create-lead) → có lead_id → upload từng ảnh (gọi function upload) → hoàn tất
4. Admin `/admin/leads`: đã có nút "Tải ảnh" (signed URL) — verify hoạt động với attachment thật

**Constraints**:
- Ảnh tối đa 3 file × 2MB, chỉ image/*; KHÔNG lưu ảnh vào DB (chỉ path)
- Consent thiếu → chặn submit
- KHÔNG public upload — mọi upload qua service role trong function

**Definition of Done**:
- Browser verify: gửi form bảo dưỡng kèm 2 ảnh → lead tạo + 2 attachment trong DB; admin `/admin/leads` tải được ảnh (signed URL); anon KHÔNG truy cập được file trực tiếp (400)
- Test data dọn sau verify

**Status**: `[ ]`

---

### [#P5T04] Verify end-to-end production + dọn test data + commit

**Goal**: Verify toàn bộ pipeline lead trên production (deploy Vercel lại): form → lead → Telegram → admin xem lead + ảnh; dọn test; cập nhật docs.

**Depends on**: `[#P5T02]` + `[#P5T03]`
**Parallel-safe**: `no`

**Concrete changes**:
1. Deploy: push + Vercel redeploy (form mới lên production)
2. Verify thật: gửi 1 lead test qua form production → check DB (supabase db query) + Telegram message đến anh (anh xác nhận) + admin mở /admin/leads thấy lead
3. Test maintenance kèm 1 ảnh → verify attachment + download qua admin
4. Dọn test leads/attachments (service role delete)
5. Cập nhật `.ai/MASTER_PLAN.md` Phase 5 kết quả + DECISIONS_LOG (nếu có quyết định mới)

**Constraints**:
- KHÔNG để lead test sót lại DB production (dọn sạch)
- Secret không commit

**Definition of Done**:
- Toàn bộ pipeline verified production; DB sạch test data; docs cập nhật; sweep Phase 5 (MASTER_PLAN compress + prune tasks) — Phase 5 chạm backend/public → Reviewer gate trước khi sweep nếu cần (đánh giá: function đơn giản + rate limit → Mika verify + adversarial đủ, Reviewer khi có upload/Telegram phức tạp — quyết định tại chỗ)

**Status**: `[ ]`

---

## Phase 6: SEO + Tracking + Performance
_(chưa băm task)_

## Phase 7: Release A Gate + Deploy TENTEN
_(chưa băm task)_

## Phase 8: AI Concierge — Release B
_(chưa băm task — gated: chờ sử dụng thật)_

## Phase 9: Full AI — nội bộ + Vision + Research
_(chưa băm task — gated: chờ ROI Release B)_
