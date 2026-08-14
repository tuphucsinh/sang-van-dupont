# TASKS — SangDupont WBS

> Quản lý bởi Mika. Runner KHÔNG được sửa file này.
> Format task chuẩn theo AGENTS.md `/plan2task` (8 fields). ID: `[#PxTzz]` (project nhỏ, không milestone).
> MASTERPLAN APPROVED 2026-08-14.

## Phase 1: Foundation — ✅ DONE 2026-08-14
## Phase 2: Supabase Foundation — ✅ DONE 2026-08-14 (Reviewer PASS SW-P2-MIGRATIONS-01)
## Phase 3: Catalog + Product Detail — ✅ DONE 2026-08-14
## Phase 4: Admin/CMS tối giản — ✅ DONE 2026-08-14 (Reviewer PASS SW-P4-ADMIN-01 + verify production)
## Phase 5: Lead Pipeline + Telegram — ✅ DONE 2026-08-14 (Reviewer PASS SW-P5-LEADPIPE-01 + verify production E2E)
_(chi tiết từng phase: `.ai/MASTER_PLAN.md`; task `[x]` đã prune theo RULE 3 sweep)_

## Phase 6: SEO + Tracking + Performance

### [#P6T01] `app/sitemap.ts` + `app/robots.ts` + metadata hoàn thiện — SEO VI/EN

**Goal**: Sitemap.xml + robots.txt chuẩn cho static export; hoàn thiện metadata (canonical/hreflang/OG) cho trang chủ + 16 trang product; JSON-LD Organization.

**Depends on**: `none` (dùng lib/catalog có sẵn)
**Parallel-safe**: `no`

**Context hiện có**:
- `app/layout.tsx` metadata chung (title/description); product pages đã có generateMetadata (canonical + languages hreflang) từ P3T04
- `output:'export'` — Next tự sinh `sitemap.xml` + `robots.txt` từ app/sitemap.ts + app/robots.ts vào out/
- Slug products: 8 available (lấy qua getAllProducts())

**Concrete changes**:
1. `app/sitemap.ts`: export default async function sitemap() — getAllProducts() → mỗi product 2 URL (`/vi/products/[slug]`, `/en/products/[slug]`) + `/` + alternates.languages cho mỗi; lastModified hôm nay; KHÔNG có admin URLs (không index admin)
2. `app/robots.ts`: allow all (trừ /admin/*), sitemap URL `https://sangdupont.vercel.app/sitemap.xml`
3. `app/layout.tsx`: metadataBase = https://sangdupont.vercel.app; openGraph (siteName, locale vi_VN, images logo); alternates canonical `/` + languages {vi:'/', en:'/en'} — CHỈ khi KHÔNG phá root layout (nếu phá build thì bỏ languages ở root, giữ metadataBase + OG)
4. `components/ProductDetail.tsx`: thêm JSON-LD Organization? KHÔNG — giữ Product JSON-LD đã có; chỉ verify hreflang alternates đúng (đã có)
5. `app/en/page.tsx`? KHÔNG — trang chủ không có bản /en (D16: chỉ product detail có /en) — ghi rõ trong sitemap không thêm /en

**Constraints**:
- KHÔNG index /admin; KHÔNG thêm /en root (không tồn tại)
- metadataBase cần URL thật (không localhost) — dùng https://sangdupont.vercel.app
- KHÔNG commit; KHÔNG chạy lệnh ngoài build verify (Mika chạy)

**Definition of Done**:
- Build PASS; `out/sitemap.xml` chứa 17 URL (1 root + 16 product VI/EN); `out/robots.txt` allow + sitemap; grep title/OG trong out/index.html đúng

**Status**: `[x] — verified 2026-08-14 (Mika): sitemap 17 URL + robots disallow /admin + metadataBase/OG (build PASS)`

---

### [#P6T02] `components/Ga4.tsx` + wire — GA4 tối thiểu + events lead

**Goal**: GA4 tracking tối thiểu: page_view (GA4 tự gửi khi dùng gtag), `start_form` + `submit_form` + `qualified_lead` theo MASTER_PLAN (dependency P5 form).

**Depends on**: `[#P5T02]` (LeadForm có sẵn — wire events)
**Parallel-safe**: `no`

**Context hiện có**:
- `app/layout.tsx` (server) — cần chèn GA4 script vào <head>
- LeadForm.tsx (client) — nơi fire events start_form/submit_form
- Measurement ID: **cần anh cung cấp** (G-XXXXXX) — tạm đọc từ `process.env.NEXT_PUBLIC_GA4_ID` (rỗng = không load script, an toàn khi chưa có)

**Concrete changes**:
1. `components/Ga4.tsx` (client): nhận gaId prop; render `<script async src="https://www.googletagmanager.com/gtag/js?id=...">` + inline config `gtag('config', gaId)`; export helper `track(event, params)` — `window.gtag?.('event', event, params)` guard
2. `app/layout.tsx`: `const gaId = process.env.NEXT_PUBLIC_GA4_ID;` → nếu có → render `<Ga4 gaId={gaId} />` trong body (hoặc head) — KHÔNG phá layout nếu env rỗng
3. `components/LeadForm.tsx`: 
   - fire `start_form` khi user focus/change field đầu tiên (1 lần)
   - fire `submit_form` với params {type, request_code, status: ok|error} sau khi nhận response (thành công/429/400)
   - helper track từ Ga4 (export riêng từ file Ga4 để import được)
4. KHÔNG track PII (tên/ĐT KHÔNG gửi lên GA4 — chỉ type + request_code + ok/error)

**Constraints**:
- Nếu env rỗng → component render null, KHÔNG break build
- KHÔNG gửi PII (name/phone) vào GA4
- KHÔNG commit; KHÔNG chạy lệnh (build verify Mika)

**Definition of Done**:
- Build PASS cả 2 case (có/không env); grep `gtag` trong out/index.html khi env có
- Browser verify (Mika, có env test): điền form → network thấy gtag event start_form + submit_form; console không lỗi

**Status**: `[x] — verified 2026-08-14 (Mika): GA4 env-rỗng safe + gtag khi có env, track start_form/submit_form (build PASS 2 case)`

---

### [#P6T03] Performance: preload hero + lazy-load ảnh + font display — Lighthouse ≥85/90

**Goal**: Tối ưu Core Web Vitals cho static export: preload hero, lazy-load gallery/similar, font-display swap, giảm CLS.

**Depends on**: `none`
**Parallel-safe**: `no`

**Context hiện có**:
- `app/globals.css` (từ P1T03) — @import font Google (Playfair Display, Cinzel); ảnh hero img thường
- ProductDetail gallery/similar dùng `<img>` (P3T04) — chưa lazy
- `out/` static — Lighthouse đo qua Chrome

**Concrete changes**:
1. Hero: thêm `<link rel="preload" as="image" href="/assets/img/hero.jpg">` trong `app/layout.tsx` head (hoặc page.tsx) — chỉ desktop hero; mobile hero-mobile không preload (để CSS media quyết định)
2. ProductDetail gallery: `loading="lazy"` + `decoding="async"` cho media.slice(1) + similar cards; cover KHÔNG lazy (LCP)
3. Collection cards (Collection.tsx): img `loading="lazy"` (dưới fold) — KHÔNG lazy ảnh đầu? Collection nằm dưới hero → lazy hết hợp lý
4. Fonts: verify `font-display: swap` trong CSS Google Fonts import (thường có sẵn `display=swap` — kiểm tra URL import; nếu thiếu thêm `&display=swap`)
5. `next.config.ts`: KHÔNG đổi (output export đã tối ưu)

**Constraints**:
- KHÔNG next/image (static export — đã chốt D1); KHÔNG đổi layout cấu trúc
- Lazy KHÔNG áp cho LCP (hero + cover detail)
- KHÔNG commit; KHÔNG chạy lệnh (build verify Mika)

**Definition of Done**:
- Build PASS; grep `loading="lazy"` trong out (gallery/similar/collection); `display=swap` trong CSS
- Lighthouse (Mika, Chrome thật): mobile Perf ≥ 85, desktop ≥ 90 — ghi số thật vào tasks

**Status**: `[x] — verified 2026-08-14 (Mika): preload hero + lazy gallery/similar/collection (build PASS)`

---

### [#P6T04] Verify tổng Phase 6: Lighthouse + SEO check + deploy + sweep

**Goal**: Chạy Lighthouse thật (mobile + desktop), verify sitemap/robots trên production, deploy Vercel, sweep Phase 6.

**Depends on**: `[#P6T01]` + `[#P6T02]` + `[#P6T03]`
**Parallel-safe**: `no`

**Concrete changes**:
1. Lighthouse: Chrome thật (không headless? — dùng headless=new với --no-sandbox được) — chạy qua `npx lighthouse` hoặc CDP metrics thủ công (Mika chọn cách có sẵn; nếu không có lighthouse npm → dùng Chrome DevTools Protocol Performance metrics + manual LCP/CLS estimate — ghi rõ phương pháp)
2. Verify production: `sangdupont.vercel.app/sitemap.xml` 200 + 17 URLs; `/robots.txt` 200; meta OG trên trang chủ; hreflang trên product page
3. Deploy Vercel (push + vercel --prod)
4. Cập nhật MASTER_PLAN Phase 6 kết quả + DECISIONS_LOG (GA4 ID thật khi anh cấp; số Lighthouse)
5. Sweep: prune tasks `[x]`, commit

**Constraints**:
- Ghi số LIghtshot THẬT (không đoán); nếu < ngưỡng → ghi rõ lệch bao nhiêu + việc tiếp theo
- Reviewer gate: Phase 6 không chạm auth/DB write → Mika verify + adversarial đủ (không cần Reviewer) — theo note static nhỏ

**Definition of Done**:
- Lighthouse số thật ghi vào MASTER_PLAN; production verify xong; sweep xong

**Status**: `[ ] — chờ verify Lighthouse + deploy`

---

## Phase 7: Release A Gate + Deploy TENTEN
_(chưa băm task)_

## Phase 8: AI Concierge — Release B
_(chưa băm task — gated: chờ sử dụng thật)_

## Phase 9: Full AI — nội bộ + Vision + Research
_(chưa băm task — gated: chờ ROI Release B)_
