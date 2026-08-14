# TASKS — SangDupont WBS

> Quản lý bởi Mika. Runner KHÔNG được sửa file này.
> Format task chuẩn theo AGENTS.md `/plan2task` (8 fields). ID: `[#PxTzz]` (project nhỏ, không milestone).
> MASTERPLAN APPROVED 2026-08-14.

## Phase 1: Foundation — Repo chuẩn hóa + Next.js/TS migration — ✅ DONE 2026-08-14
_(4 task P1T01–P1T04 đã xong — chi tiết: `.ai/MASTER_PLAN.md` Phase 1; task `[x]` đã prune theo RULE 3 sweep)_

## Phase 2: Supabase Foundation — DB + Auth + Storage + RLS

### [#P2T01] repo-root `supabase` CLI + project init + link (cần anh cấp access token)

**Goal**: Cài/verify Supabase CLI, tạo project mới (Free), link project vào repo để chạy migration — nền tảng cho mọi task Phase 2.

**Depends on**: `none`
**Parallel-safe**: `no` (mọi task P2 phụ thuộc project tồn tại)

**Context hiện có**:
- Chưa có `supabase` CLI, chưa có `supabase/` dir, chưa có `.env` trong repo (verified 2026-08-14)
- Repo: `/home/pi5/projects/Sangwebsite`, Next.js App Router + TS, static export

**Concrete changes** (Mika thực thi — cần credentials):
1. Cài Supabase CLI (theo docs hiện hành cho Linux arm64; nếu không cài được → dùng dashboard web + SQL editor)
2. `supabase login` (cần **access token** — anh cung cấp, KHÔNG ghi vào repo/file được commit)
3. `supabase projects create sangdupont --org <org> --db-password <pass>` (Free plan)
4. `supabase init` + `supabase link --project-ref <ref>`
5. Tạo `.env.local` (gitignored): `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-safe) + `SUPABASE_SERVICE_ROLE_KEY` (chỉ server/Edge — KHÔNG client)

**Constraints**:
- Secret tuyệt đối không vào git: verify `.env.local` trong `.gitignore` (thêm nếu thiếu)
- DB password tự generate mạnh, lưu vào `.tmp/` (gitignored) — không commit
- KHÔNG dùng `--dangerously-skip-permissions` hay bất kỳ flag bypass

**Definition of Done**:
- `supabase --version` chạy được; `supabase projects list` hiện project `sangdupont`
- `supabase status` (hoặc `link --project-ref`) báo linked
- `.env.local` tồn tại + gitignored; `git status` không lộ secret

**Status**: `[x]` — verified 2026-08-14 (Mika): CLI 2.114.0, project `sangwebsite` đã tồn tại (ACTIVE_HEALTHY, PG17, ap-northeast-1 — anh tạo sẵn), link OK, .env.local gitignored (anon+service key, chmod 600, không commit)

---

### [#P2T02] `supabase/migrations/<ts>_schema_core.sql` — Schema core 9 bảng + enum + index

**Goal**: Tạo migration SQL định nghĩa toàn bộ schema core (products, product_media, services, testimonials, case_studies, faq, leads, lead_attachments, site_settings) + enum + index — replay được từ bản sạch.

**Depends on**: `[#P2T01]`
**Parallel-safe**: `no`

**Context hiện có**:
- Data model core: `.ai/ARCHITECT.md` §3 (erDiagram + bảng + index slug/status/created_at)
- Status enum products: `draft|available|reserved|sold|archived`; leads: `new|contacted|qualified|won|lost`

**Concrete changes**:
1. File migration mới trong `supabase/migrations/` (timestamp prefix, vd `20260814090000_schema_core.sql`)
2. `CREATE TYPE product_status AS ENUM ('draft','available','reserved','sold','archived');` + `CREATE TYPE lead_status AS ENUM ('new','contacted','qualified','won','lost');`
3. Bảng theo ARCHITECT §3 đúng field/type/quan hệ (FK, UK slug, timestamptz created_at default now())
4. Index: `products.slug` (unique), `products.status`, `leads.created_at`, `leads.status`
5. Bảng content: `services` (VI/EN fields), `testimonials`, `case_studies`, `faq` (VI/EN), `site_settings` (key-value JSONB/text)

**Constraints**:
- KHÔNG đổi schema ARCHITECT đã duyệt (thêm field = thêm task riêng); migration thuần SQL, idempotent-safe (dùng `IF NOT EXISTS` nơi hợp lý)
- KHÔNG thêm RLS trong file này (task P2T03 riêng)
- KHÔNG commit — Mika verify sau

**Definition of Done**:
- File migration tồn tại đúng path `supabase/migrations/`
- SQL parse được: `supabase db reset` (local) hoặc apply lên project chạy sạch không lỗi
- `\dt`/information_schema: đủ 9 bảng + 2 enum + index đúng

**Status**: `[x]` — verified 2026-08-14 (Mika): db push PASS, dump remote đủ 9 bảng + 2 enum; runner agy viết file chuẩn 104 dòng

---

### [#P2T03] `supabase/migrations/<ts>_rls_policies.sql` — RLS + admin auth config

**Goal**: Bật RLS mọi bảng, policy public read an toàn (chỉ product available + content public), mọi write admin-only; auth admin-only tắt public signup.

**Depends on**: `[#P2T02]`
**Parallel-safe**: `no`

**Context hiện có**:
- Security model: `.ai/ARCHITECT.md` §4 — public chỉ đọc `status=available` products + public content; leads/attachments admin-only
- Auth: Supabase Auth, admin only, tắt public signup (MASTER_PLAN P2)

**Concrete changes**:
1. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` cho MỌI bảng
2. Policy public read: products `WHERE status='available'`; services/testimonials/case_studies/faq/site_settings: `USING (true)` (content công khai)
3. Policy admin: mọi bảng `USING (auth.role() = 'authenticated')` + `WITH CHECK` tương ứng cho INSERT/UPDATE/DELETE (lead/lead_attachments KHÔNG có public read)
4. `site_settings`: read public, write admin
5. Ghi chú (comment SQL): tắt public signup — Supabase dashboard → Authentication → Providers → Email → disable "Allow new users to sign up" (thao tác UI, không phải SQL thuần — ghi rõ trong file comment)

**Constraints**:
- RLS bắt buộc mọi bảng exposed (ARCHITECT §4) — không bỏ sót bảng nào
- KHÔNG tạo policy cho phép public write bất kỳ bảng nào
- KHÔNG commit

**Definition of Done**:
- File SQL tồn tại; apply sạch
- Test RLS (Mika verify): anon key đọc được product available + faq; anon KHÔNG đọc được leads/lead_attachments; admin (authenticated) CRUD được

**Status**: `[x]` — verified 2026-08-14 (Mika): applied + test REST thật — anon đọc chỉ `test-available` (ẩn draft), anon leads rỗng, anon INSERT leads/products → 401, service role đọc được lead; test data đã dọn

---

### [#P2T04] `supabase/migrations/<ts>_storage.sql` — Storage buckets + policies

**Goal**: Tạo buckets: product images (public, ảnh đã tối ưu) + lead attachments (private, admin-only); policy storage đúng quyền.

**Depends on**: `[#P2T03]`
**Parallel-safe**: `no`

**Context hiện có**:
- ARCHITECT §4: bucket product = public (ảnh tối ưu WebP/AVIF); bucket lead = private (RLS + signed URL ngắn hạn qua Edge Function sau này)
- File 1 §8: giới hạn kích thước ảnh, retention/xóa ảnh lead cũ theo policy

**Concrete changes**:
1. `insert into storage.buckets` 2 bucket: `product-images` (public=true), `lead-attachments` (public=false)
2. Policy storage: public read `product-images`; admin-only read/write `lead-attachments` (`auth.role()='authenticated'`)
3. Không ai public write được `product-images` (admin/Edge-only write)

**Constraints**:
- KHÔNG nhét binary vào DB — storage buckets riêng (file 1 §8)
- KHÔNG commit

**Definition of Done**:
- Apply sạch; 2 bucket tồn tại đúng public/private
- Test (Mika): anon download được ảnh product, KHÔNG download được lead attachment; authenticated download được cả

**Status**: `[x]` — verified 2026-08-14 (Mika): applied + test storage thật — service upload 200, anon upload chặn 400, anon download product public 200, anon download lead private chặn 400, service download lead 200; test files đã xóa

---

### [#P2T05] `supabase/seed.sql` + `scripts/db-backup.sh` — Seed dữ liệu mẫu + backup thủ công

**Goal**: Seed tối thiểu (1-2 product mẫu available + 1 faq + 1 testimonial) để verify pipeline; script backup DB thủ công định kỳ (Free không auto-backup).

**Depends on**: `[#P2T03]`
**Parallel-safe**: `no`

**Context hiện có**:
- File 1 §8: Free không có automatic DB backup → backup thủ công bắt buộc
- ENGINEERING PRACTICE (AGENTS.md): seed dữ liệu test → snapshot trước + restore sau + verify đa chiều

**Concrete changes**:
1. `supabase/seed.sql`: 2 product available (slug, VI/EN, status, price) + 1 faq + 1 testimonial + 1 lead (để test RLS) — data rõ ràng là MẪU (prefix `[SEED]` trong tên)
2. `scripts/db-backup.sh`: `supabase db dump` (hoặc pg_dump qua connection string từ .env.local) → file timestamped ngoài repo (`/home/pi5/hermes-artifacts/sangdupont-db/`), giữ N bản gần nhất, xóa cũ
3. Ghi chú README ngắn trong scripts/ cách chạy

**Constraints**:
- Seed data KHÔNG được giống/trùng sản phẩm thật (tránh nhầm lẫn production) — prefix `[SEED]`
- Backup script không chứa secret (đọc connection string từ .env.local — gitignored)
- KHÔNG commit

**Definition of Done**:
- `supabase db reset` + seed chạy sạch; product available hiện qua anon key
- `scripts/db-backup.sh` chạy tạo file backup đúng path, exit 0; chạy lần 2 tạo bản mới

**Status**: `[ ]`

---

## Phase 3: Catalog + Product Detail
_(chưa băm task)_

## Phase 4: Admin/CMS tối giản
_(chưa băm task)_

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
