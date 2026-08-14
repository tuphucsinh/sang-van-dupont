# TASKS — SangDupont WBS

> Quản lý bởi Mika. Runner KHÔNG được sửa file này.
> Format task chuẩn theo AGENTS.md `/plan2task` (8 fields). ID: `[#PxTzz]` (project nhỏ, không milestone).
> MASTERPLAN APPROVED 2026-08-14.

## Phase 1: Foundation — Repo chuẩn hóa + Next.js/TS migration — ✅ DONE 2026-08-14
_(4 task P1T01–P1T04 đã xong — chi tiết: `.ai/MASTER_PLAN.md` Phase 1; task `[x]` đã prune theo RULE 3 sweep)_

## Phase 2: Supabase Foundation — DB + Auth + Storage + RLS — ✅ DONE 2026-08-14
_(5 task P2T01–P2T05 đã xong + Reviewer PASS SW-P2-MIGRATIONS-01 — chi tiết: `.ai/MASTER_PLAN.md` Phase 2; task `[x]` đã prune theo RULE 3 sweep)_

## Phase 3: Catalog + Product Detail

### [#P3T01] `supabase/seed.sql` — Catalog thật 9 sản phẩm + product_media (thay seed `[SEED]`)

**Goal**: Thay seed mẫu bằng 9 sản phẩm THẬT (tên/alt từ I18N dict landing p1–p9), ảnh dùng file hiện có, price NULL = "Liên hệ" — nguồn dữ liệu canonical cho catalog SSG.

**Depends on**: `none` (Phase 2 đã có schema)
**Parallel-safe**: `no` (đụng DB + ảnh)

**Context hiện có**:
- Schema: `products` (slug/name_vi/name_en/line/material/condition/desc_vi/desc_en/price/status), `product_media` (url/kind/sort_order) — ARCHITECT §3
- Ảnh hiện có trong `public/assets/img/`: `img_01.jpg` (Ligne 1 Guilloché), `img_02.jpg` (Cơ chế đánh lửa), `img_03.jpg` (Dấu khắc), `img_04.jpg` (L2 Diamond 80s), `img_05.jpg` (Xanh đen), `img_08.jpg` (Sơn mài đen), `img_11.jpg` (Bộ sưu tầm), `img_12.jpg` (Gatsby 90s), `img_13.jpg` (L2 Diamond vàng khía)
- I18N dict (index.html): p1–p9 = tên + tag VI/EN

**Concrete changes**:
1. `supabase/seed.sql`: xóa 2 product `[SEED]` + lead `[SEED]` (giữ faq/testimonial? → xóa luôn để seed sạch, chỉ catalog)
2. INSERT 9 products: slug = `l2-diamond-80s`, `ligne1-guilloche`, `black-lacquer`, `green-black-classic`, `gatsby-90s`, `l2-diamond-fluted`, `brand-hallmarks`, `ignition-mechanism`, `collector-set`; name_vi/name_en = dict p1–p9; line/material/condition/desc_vi/desc_en hợp lý (desc lấy từ alt/ý nghĩa ảnh — KHÔNG bịa giá: price NULL); status = 'available' (8) + 'reserved' (1 — để test badge)
3. INSERT product_media: mỗi product 1 cover + 1 gallery (dùng 2 ảnh gần nhau, url = `/assets/img/img_XX.jpg`)
4. Apply: `supabase db query --linked -f supabase/seed.sql` (sau khi xóa dữ liệu cũ qua service role)

**Constraints**:
- KHÔNG đặt giá bịa — price NULL (UI hiện "Liên hệ")
- Ảnh URL dùng path static `/assets/img/...` (D15 — không Storage)
- Seed KHÔNG chạy khi DB đã có data sản xuất (đây là seed dev đầu tiên — OK xóa cũ)

**Definition of Done**:
- Anon GET `/rest/v1/products?select=slug,status` trả đủ 9 (8 available + 1 reserved)
- Anon GET product_media trả đủ 9+ cover
- Các file ảnh tham chiếu tồn tại trong `public/assets/img/`

**Status**: `[x]` — verified 2026-08-14 (Mika): apply OK, anon thấy 8 available (reserved ẩn đúng RLS), 16 media (8 cover+8 gallery), mọi ảnh tồn tại

---

### [#P3T02] `lib/supabase.ts` + `lib/catalog.ts` — Supabase client + fetch catalog build-time

**Goal**: Tạo client Supabase (server-side) + hàm fetch products + media + helper getProductBySlug — dùng tại build cho SSG; guard thiếu env → trả [] không crash build.

**Depends on**: `[#P3T01]` (data sạch để test fetch)
**Parallel-safe**: `no`

**Context hiện có**:
- `.env.local` (gitignored) có `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (đã verify anon đọc được available)
- Next.js App Router + TS strict; chưa cài `@supabase/supabase-js`

**Concrete changes**:
1. `npm install @supabase/supabase-js` (dependency mới — ghi chú vào report)
2. `lib/supabase.ts`: `createClient(url, anonKey)` từ `process.env.NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`; không có env → export null client
3. `lib/catalog.ts`:
   - `getAllProducts()`: fetch products (status IN available,reserved) + product_media theo product_id (2 query, map trong code); sắp xếp theo sort_order/media
   - `getProductBySlug(slug)`: filter từ getAllProducts (catalog nhỏ — không cần query riêng)
   - `getSimilarProducts(product, limit=3)`: cùng `line` trước, khác slug
   - Kiểu TS đầy đủ: `Product { id, slug, nameVi, nameEn, line, material, condition, descVi, descEn, price, status, media: {url, kind}[] }`
4. Mọi hàm bọc try/catch + `!client → return []` — build CI thiếu env không crash (log warning)

**Constraints**:
- KHÔNG dùng service role key ở client/build — chỉ anon (RLS đã giới hạn available+reserved... LƯU Ý: RLS public chỉ đọc `status=available` — reserved sẽ KHÔNG về qua anon! → fetch chỉ available; badge reserved test chuyển Phase sau khi có admin) → **sửa spec: getAllProducts chỉ lấy available** (đúng RLS)
- KHÔNG fetch tại runtime từ client — build-time only (SSG, D14)

**Definition of Done**:
- `npx tsx .tmp/test-catalog.ts` (import thật): getAllProducts trả ≥9, mỗi product có media cover
- `npm run lint` + `npx tsc --noEmit` PASS

**Status**: `[x]` — verified 2026-08-14 (Mika): tsx test PASS (8 products, mọi cái có cover, bySlug/similar/ghost OK), lint 0 errors, tsc PASS; fix any + unused var

---

### [#P3T03] `app/page.tsx` + `components/Collection.tsx` — Catalog SSG render thật (thay ảnh static hiện tại)

**Goal**: Collection section render TỪ DỮ LIỆU Supabase (build-time), mỗi card = product + badge trạng thái + link tới detail + CTA hỏi đúng sản phẩm; giữ visual parity.

**Depends on**: `[#P3T02]`
**Parallel-safe**: `no`

**Context hiện có**:
- `components/Collection.tsx`: hiện hardcode 9 card ảnh tĩnh img_XX + cap b/span (từ P1T03)
- `app/page.tsx`: server component ghép Nav/Hero/Marquee/Collection/About/Services/Contact/Lightbox/Footer
- `next.config.ts`: `output:'export'`

**Concrete changes**:
1. `app/page.tsx` (server): `const products = await getAllProducts()` → truyền vào Collection
2. `components/Collection.tsx`: render `products.map` — card giữ class `card reveal [d1|d2|tall]` (pattern cũ), img = product.media cover, cap = nameVi + tag (line), badge status (available → không badge / reserved → "Đã giữ" vàng — chỉ 1 bản test)
3. Card link: `<Link href={/vi/products/${slug}}>` (VI mặc định)
4. CTA "hỏi đúng sản phẩm": nút nhỏ trong cap → `https://zalo.me/84905076886?text=...` + Telegram `https://t.me/sangdupontbot?text=...` (encodeURIComponent tên sản phẩm) — stopPropagation để không đè link card
5. KHÔNG xóa Lightbox (giữ cho gallery landing) — card click vẫn mở lightbox? → QUYẾT ĐỊNH: card giờ là Link đi detail (bỏ lightbox khỏi collection; lightbox chỉ còn nếu ảnh hero dùng) — cập nhật Lightbox listener nếu cần

**Constraints**:
- Visual parity: giữ grid 9 card, cùng class, cùng kích thước ảnh (aspect giữ nguyên)
- Badge status map đủ mọi status có thể hiện (available/reserved/sold — draft/archived ẩn)
- KHÔNG innerHTML; ảnh `<img>` thường (no next/image — D1)
- KHÔNG fetch client-side

**Definition of Done**:
- `npm run build` PASS; `out/` chứa HTML có 9 product name thật (grep)
- Browser verify (Mika): collection hiện 9 card, 1 badge "Đã giữ", click card → `/vi/products/<slug>` mở, no console error

**Status**: `[ ]`

---

### [#P3T04] `app/[lang]/products/[slug]/page.tsx` + `components/ProductDetail.tsx` — Trang chi tiết sản phẩm VI/EN

**Goal**: Product detail page: SSG cho mọi (lang × slug), gallery ảnh, metadata/OG + structured data, CTA Zalo/Telegram/call, similar products — nền SEO Phase 6.

**Depends on**: `[#P3T03]`
**Parallel-safe**: `no`

**Context hiện có**:
- `next.config.ts` output export → cần `generateStaticParams` + `dynamicParams = false` (404 cho slug lạ)
- `app/layout.tsx` metadata mặc định; chưa có route `[lang]`
- I18n: `components/I18nProvider.tsx` (client, toggle) — detail page dùng lang prop từ route, KHÔNG cần provider (server render sẵn)

**Concrete changes**:
1. `app/[lang]/products/[slug]/page.tsx`:
   - `generateStaticParams()`: mọi product × ['vi','en'] → {lang, slug}
   - `generateMetadata()`: title = nameVi/nameEn + " — Sang Van", description = desc, openGraph images = cover, alternates canonical + hreflang vi/en
   - page: `getProductBySlug(slug)` → notFound() nếu null; render `ProductDetail` với lang
2. `components/ProductDetail.tsx` (server): breadcrumb (Trang chủ / Sản phẩm / tên), title + line + condition, price hoặc "Liên hệ" button (Zalo/Telegram/Call), gallery (cover + media map, click mở lightbox local), desc, similar (3 sản phẩm cùng line — link VI/EN theo lang)
3. JSON-LD: `Product` schema (name, image, description, sku=slug; KHÔNG bịa price/availability chính xác → ghi availability "InStock" chỉ khi available; không price → bỏ offer)
4. `app/[lang]/products/page.tsx` (tùy chọn): listing đơn giản 9 card (cùng Collection, lang-aware) — nếu tốn → bỏ, chỉ detail (quyết định khi làm: ƯU TIÊN BỎ — Phase 3 chỉ detail, listing dùng trang chủ)
5. Static export: đảm bảo `out/vi/products/*.html` + `out/en/products/*.html` sinh ra

**Constraints**:
- KHÔNG bịa price/availability trong structured data
- `dynamicParams = false` (404 cho slug không tồn tại — static export cần)
- Nội dung theo lang: name/desc VI hay EN đúng route
- KHÔNG client-fetch; ảnh `<img>` thường

**Definition of Done**:
- Build PASS; `out/vi/products/l2-diamond-80s.html` + `out/en/...` tồn tại
- Browser verify: mở `/vi/products/l2-diamond-80s` — title/desc đúng VI, gallery hiện, similar 3, CTA link đúng; `/en/...` — nội dung EN; slug lạ → 404
- No console error; JSON-LD có trong HTML (grep)

**Status**: `[ ]`

---

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
