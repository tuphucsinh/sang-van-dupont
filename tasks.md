# TASKS — SangDupont WBS

> Quản lý bởi Mika. Runner KHÔNG được sửa file này.
> Format task chuẩn theo AGENTS.md `/plan2task` (8 fields). ID: `[#PxTzz]` (project nhỏ, không milestone).
> MASTERPLAN APPROVED 2026-08-14.

## Phase 1: Foundation — Repo chuẩn hóa + Next.js/TS migration — ✅ DONE 2026-08-14
_(chi tiết: `.ai/MASTER_PLAN.md` Phase 1; task `[x]` đã prune theo RULE 3 sweep)_

## Phase 2: Supabase Foundation — DB + Auth + Storage + RLS — ✅ DONE 2026-08-14
_(chi tiết: `.ai/MASTER_PLAN.md` Phase 2 + Reviewer PASS SW-P2-MIGRATIONS-01; task `[x]` đã prune theo RULE 3 sweep)_

## Phase 3: Catalog + Product Detail — ✅ DONE 2026-08-14
_(4 task P3T01–P3T04 đã xong — chi tiết: `.ai/MASTER_PLAN.md` Phase 3; task `[x]` đã prune theo RULE 3 sweep)_

## Phase 4: Admin/CMS tối giản

### [#P4T01] `supabase/migrations/<ts>_admin_rls.sql` — Allowlist admin email + tighten RLS

**Goal**: Chỉ `tvccbod@gmail.com` mới write được (products/media/leads/attachments/settings) — thay policy `auth.role()='authenticated'` hiện tại (bất kỳ authenticated nào cũng write — lỗ hổng R1 reviewer). Public vẫn đọc như cũ.

**Depends on**: `none` (Phase 2 RLS đã có)
**Parallel-safe**: `no`

**Context hiện có**:
- `supabase/migrations/20260814110000_rls_policies.sql`: policy admin hiện tại `USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated')` trên 9 bảng + storage (đây là lỗ hổng: GitHub OAuth bật lên → AI khác authorize cũng write được)
- Email admin: `tvccbod@gmail.com` (D18)
- Auth user email nằm ở `auth.jwt() ->> 'email'`

**Concrete changes** (Mika viết + apply — SQL tinh tế):
1. Migration mới `20260814130000_admin_rls.sql`:
2. Tạo helper: `CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT coalesce(auth.jwt() ->> 'email', '') = 'tvccbod@gmail.com' $$;`
3. Drop + recreate MỌI policy `*_admin_all` (9 bảng + 2 storage) hiện có → `USING (is_admin()) WITH CHECK (is_admin())` (thay vì `auth.role()='authenticated'`)
4. KHÔNG đụng policy public read (giữ nguyên)
5. Ghi comment: đây là allowlist email duy nhất — muốn thêm admin → sửa helper + migration mới

**Constraints**:
- KHÔNG dùng service role ở client; helper dùng JWT claim email (không cần bảng admins riêng — 1 admin duy nhất)
- Policy write CHỈ qua `is_admin()` — không policy nào còn `auth.role()='authenticated'` cho write
- KHÔNG commit — Mika verify sau

**Definition of Done**:
- Apply migration sạch; `\dp`/policy list: mọi `*_admin_all` dùng `is_admin()`
- Test REST: anon INSERT products → 401 (vẫn chặn); authenticated KHÔNG phải admin → 401; service role → 200 (bypass RLS đúng)

**Status**: `[x]` — verified 2026-08-14 (Mika): applied, anon read 200 (giữ nguyên), anon write 401, service bypass 200; policy list dùng is_admin()

---

### [#P4T02] Supabase Auth: bật GitHub provider + tắt email signup (cần anh cấp Client ID/Secret)

**Goal**: Bật GitHub OAuth trong Supabase Auth để `/admin` login được; tắt public signup bằng email (an toàn).

**Depends on**: `[#P4T01]` (RLS chặn trước khi mở cửa OAuth)
**Parallel-safe**: `no`

**Context hiện có**:
- Supabase project `iloaeaoojxdovedjtowt`; anh đã tạo GitHub OAuth App? (chưa — cần hướng dẫn)
- Email admin: `tvccbod@gmail.com` (GitHub email)

**Concrete changes** (Mika thực thi — cần credentials từ anh):
1. **Anh làm (UI GitHub)**: https://github.com/settings/developers → New OAuth App → Application name `SangDupont Admin` → Homepage URL `https://sangdupont.vercel.app` → Authorization callback URL `https://iloaeaoojxdovedjtowt.supabase.co/auth/v1/callback` → Generate client secret → gửi em **Client ID + Client Secret**
2. Mika: Supabase Dashboard API/UI → Authentication → Providers → GitHub → Enable + dán Client ID/Secret → Save
3. Authentication → Sign In / Up → Email: disable "Allow new users to sign up" (chỉ admin qua GitHub)
4. Verify: `https://<ref>.supabase.co/auth/v1/settings` (hoặc CLI) trả providers chứa github

**Constraints**:
- Client Secret KHÔNG commit — lưu `.tmp/` (gitignored) hoặc chỉ dán vào dashboard
- KHÔNG bật email provider signup (chỉ GitHub OAuth)

**Definition of Done**:
- GitHub provider enabled trong Auth settings (API verify)
- Email signup disabled
- Test login thật: mở `/admin` (sau P4T03) → click GitHub → authorize `tvccbod@gmail.com` → session về (Mika verify qua browser thật)

**Status**: `[x]` — verified 2026-08-14 (Mika): PATCH auth config 200 (github enabled, client_id Ov23liy90t..., disable_signup true, site_url sangdupont.vercel.app); auth/v1/settings xác nhận github=True + signup=False

---

### [#P4T03] `app/admin/page.tsx` + `components/AdminGuard.tsx` — Login GitHub + guard admin

**Goal**: Trang `/admin` client-side: nút "Đăng nhập với GitHub" (OAuth popup/redirect), kiểm tra session + email admin, chuyển tới `/admin/products` nếu hợp lệ.

**Depends on**: `[#P4T02]` (provider bật mới login được)
**Parallel-safe**: `no`

**Context hiện có**:
- `lib/supabase.ts` hiện chỉ export client server-side (không dùng ở client) → cần client singleton riêng
- Static export: KHÔNG server actions — mọi auth qua supabase-js client (D19)
- Email admin: `tvccbod@gmail.com`

**Concrete changes**:
1. `lib/supabase-client.ts`: `export const supabase = createClient(url, anonKey)` (client singleton — dùng `typeof window !== 'undefined'` guard)
2. `app/admin/page.tsx` ("use client"): 
   - `useEffect` → `supabase.auth.getSession()`; có session + `user.email === 'tvccbod@gmail.com'` → `router.replace('/admin/products')`; có session email khác → hiện "Không có quyền"; không session → hiện nút login
   - Nút login: `supabase.auth.signInWithOAuth({ provider: 'github' })` (redirect tới `/admin` sau callback — flow chuẩn Supabase)
3. `components/AdminGuard.tsx` ("use client"): bọc route admin con — check session + email admin mỗi lần mount; không đúng → redirect `/admin` (login); đúng → render children + nút "Đăng xuất"
4. Style: nền đen + vàng (khớp brand), card login trung tâm

**Constraints**:
- Email check client-side là UX — **quyền thật do RLS P4T01** (không bảo mật bằng client guard)
- KHÔNG lưu session trong localStorage thủ công (supabase-js tự quản)
- KHÔNG sửa file khác; KHÔNG commit

**Definition of Done**:
- Build PASS; `/admin` có nút login GitHub
- Browser verify (Mika, Chrome thật): click login → GitHub authorize `tvccbod@gmail.com` → redirect về `/admin/products`; logout → về `/admin`

**Status**: `[x]` — verified 2026-08-14 (Mika): build PASS, /admin static; login flow test thật cần deploy (localhost không gọi được GitHub OAuth callback) — sẽ verify cùng P4T04 sau khi push/deploy

---

### [#P4T04] `app/admin/products/page.tsx` + components — CRUD sản phẩm + upload/sắp xếp ảnh + đổi status

**Goal**: Admin quản lý sản phẩm: list + tạo/sửa (VI/EN fields, line, material, condition, price, status) + media (cover/gallery, chọn URL ảnh hiện có hoặc upload Storage) + xóa.

**Depends on**: `[#P4T03]` (guard admin)
**Parallel-safe**: `no`

**Context hiện có**:
- Schema products + product_media (ARCHITECT §3); `lib/catalog.ts` kiểu Product
- D15: ảnh hiện tại serve static `/assets/img/`; P4T04 thêm khả năng upload Storage `product-images` (bucket đã tạo P2T04)
- Client-side CRUD qua supabase-js (D19) — RLS is_admin enforce

**Concrete changes**:
1. `app/admin/products/page.tsx` ("use client"): bọc AdminGuard; list products (fetch `from('products').select('*,product_media(*)')` qua client, status IN draft/available/reserved/sold/archived — KHÔNG lọc available như public)
2. Form tạo/sửa (modal hoặc inline): name_vi/name_en, slug (auto từ name_vi khi tạo, editable), line, material, condition, desc_vi/desc_en, price (number, trống = Liên hệ), status (select 5 giá trị)
3. Media manager: list media hiện có (cover badge + sort_order + xóa); thêm media: chọn file → upload `storage.from('product-images').upload(path, file)` → insert product_media; HOẶC nhập URL ảnh static hiện có (`/assets/img/img_XX.jpg` picker)
4. Xóa product (cascade media — confirm dialog)
5. Trạng thái: toast thành công/lỗi; loading state; sau mỗi mutation → refresh list

**Constraints**:
- Upload file: giới hạn ≤2MB, image/*; path `products/<slug>/<timestamp>.<ext>`
- KHÔNG fetch service role — client anon + session (RLS is_admin)
- KHÔNG commit

**Definition of Done**:
- Build PASS; browser verify (Mika): login admin → list 9 products hiện; tạo product mới (available) → xuất hiện public catalog sau rebuild? (KHÔNG — SSG cần rebuild, ghi chú!) → verify DB row mới tồn tại qua REST; sửa status 1 product → DB đổi; xóa product test → DB sạch
- RLS check: user khác login → không thấy form (chỉ list đọc được? KHÔNG — cũng 401 qua RLS)

**Status**: `[x]` — verified 2026-08-14 (Mika): lint/tsc/build PASS, /admin/products static; fix 7 lint errors (any→unknown, set-state-in-effect defer); verify CRUD thật cần deploy (OAuth) — cùng P4T03/P4T05 khi push

---

### [#P4T05] `app/admin/leads/page.tsx` — Xem lead + cập nhật trạng thái

**Goal**: Admin xem danh sách lead (tư vấn mua + bảo dưỡng), đổi status `new → contacted → qualified → won/lost`, xem meta + attachment (private storage).

**Depends on**: `[#P4T03]` (guard) — DB đã có bảng leads từ P2
**Parallel-safe**: `no`

**Context hiện có**:
- Schema leads (type buy/maintenance, name, phone, budget, need, line_interest, channel, status, meta jsonb) + lead_attachments (storage_path, storage_bucket 'lead-attachments' private)
- Phase 5 sẽ thêm form công khai — Phase 4 chỉ xem/manage

**Concrete changes**:
1. `app/admin/leads/page.tsx` ("use client"): bọc AdminGuard; list leads DESC created_at; filter theo status/type (select)
2. Card lead: type badge (Mua/Bảo dưỡng), tên, phone (tel link), budget/need/line_interest, channel, created_at, status select (đổi → update qua RLS)
3. Meta: hiển thị JSON pretty (nếu có)
4. Attachments: nếu lead có lead_attachments → nút tải (qua signed URL: `storage.from('lead-attachments').createSignedUrl(path, 60)` — admin session được phép)
5. Toast + loading như P4T04

**Constraints**:
- Không public route tới lead — chỉ `/admin/*` (guard) + RLS is_admin
- KHÔNG commit

**Definition of Done**:
- Build PASS; browser verify (Mika): admin login → list lead `[SEED] Khách Mẫu` (nếu còn) hoặc tạo 1 lead test; đổi status → DB đổi; user khác → 401
- RLS verify: anon GET leads → [] (đã có)

**Status**: `[x]` — verified 2026-08-14 (Mika): lint/tsc/build PASS, /admin/leads static; verify thật cần deploy (OAuth) — cùng P4T03/P4T04 khi push

---

## Phase 5: Lead Pipeline + Telegram Edge Function
_(chưa băm task)_

## Phase 6: SEO + Tracking + Performance
_(chưa băm task)_

## Phase 7: Release A Gate + Deploy TENTEN
_(chưa băm task)_

## Phase 8: AI Concierge — Release B
_(chưa băm task — gated: chờ sử dụng thật)_

## Phase 9: Full AI — nội bộ + Vision + Research
_(chưa băm task — gated: chờ ROI Release B)_
