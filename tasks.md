# TASKS — SangDupont WBS

> Quản lý bởi Mika. Runner KHÔNG được sửa file này.
> Format task chuẩn theo AGENTS.md `/plan2task` (8 fields). ID: `[#PxTzz]` (project nhỏ, không milestone).
> MASTERPLAN APPROVED 2026-08-14 → Phase 1 đã băm task, sẵn sàng `/do`.

## Phase 1: Foundation — Repo chuẩn hóa + Next.js/TS migration

### [#P1T01] repo-root `git tag` + dọn asset thừa (backup + cleanup)

**Goal**: Backup trạng thái repo hiện tại (tag/archive) trước khi migration; dọn asset/crawl/preview khỏi thư mục làm việc để repo sạch — không mất dữ liệu (giữ archive).

**Depends on**: `none`
**Parallel-safe**: `no` (đụng toàn repo)

**Context hiện có**:
- Repo root: `/home/pi5/projects/Sangwebsite`; git branch `main`, 3 commits đã có, ahead 3 chưa push
- `data/` + `preview/` đã trong `.gitignore` (crawl data + screenshot nội bộ — KHÔNG xóa, chỉ chuyển ra ngoài)
- `assets/img/` có nhiều logo variant thừa: `logo*.svg/png`, `logo-icon*.png`, `hero-B-*.jpg` (đã ignore 1 phần)

**Concrete changes**:
1. `git tag v0.1-pre-migration` tại HEAD hiện tại
2. `tar czf /home/pi5/hermes-artifacts/sangdupont-backup-<YYYYMMDD>.tar.gz data/ preview/ assets/` (backup ngoài repo — dữ liệu crawl + preview không trong git)
3. Chuyển `data/` + `preview/` ra `/home/pi5/hermes-artifacts/sangdupont-raw/` (mv) — KHÔNG xóa
4. Xóa asset thừa trong `assets/img/`: logo variant không dùng trong index.html (giữ: logo-final_64.png favicon, logo-v2.svg/logo-icon-v2.svg nếu được tham chiếu, hero-mobile.jpg, hero-B-desktop.jpg/mobile nếu dùng — CHECK index.html trước khi xóa; chỉ xóa file KHÔNG xuất hiện trong index.html)
5. `git status` — chỉ còn file cần thiết

**Constraints**:
- KHÔNG xóa vĩnh viễn bất kỳ dữ liệu nào: mọi thứ nghi ngờ → backup tar.gz đã tạo ở bước 2
- KHÔNG sửa index.html, KHÔNG commit file ngoài task
- Đích backup: `/home/pi5/hermes-artifacts/` (KHÔNG phải trong repo)

**Definition of Done**:
- `git tag v0.1-pre-migration` tồn tại; backup tar.gz nằm ở `/home/pi5/hermes-artifacts/`
- `data/` + `preview/` đã chuyển ra ngoài repo (không còn trong `ls` repo root)
- `assets/img/` chỉ còn file được index.html tham chiếu (verify bằng grep từng tên file)
- `git status --short` không có file lạ

**Status**: `[x]` — verified 2026-08-14 (Mika): tag + tar.gz 20.8MB tại hermes-artifacts, data/preview đã mv ra ngoài, 28 file asset thừa đã xóa, mọi ref index.html còn tồn tại

---

### [#P1T02] repo-root `create-next-app` scaffold Next.js App Router + TS strict + static export

**Goal**: Tạo nền Next.js + TypeScript (App Router) trong repo, cấu hình `output: 'export'`, lint/typecheck/build chạy được.

**Depends on**: `[#P1T01]`
**Parallel-safe**: `no`

**Context hiện có**:
- Repo hiện là static HTML thuần (index.html 658 dòng, CSS/JS inline, i18n VI/EN bằng JS `setLang`)
- Không có package.json — scaffold từ đầu vào repo root
- Chrome thật để verify: `/usr/bin/google-chrome-stable` (CẤM Chromium Debian)

**Concrete changes**:
1. Scaffold tại repo root: `npx create-next-app@latest . --typescript --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes` (nếu CLI hỏi Tailwind → **No**; hỏi Turbopack → Yes)
2. `next.config.ts`: thêm `output: 'export'` (static export) — mọi ảnh dùng `<img>` thường, KHÔNG dùng `next/image` (runtime optimization cấm)
3. `app/layout.tsx`: metadata cơ bản (title "ST DUPONT VINTAGE — Sang Van · Bật lửa sưu tầm chính hãng", description từ index.html hiện tại)
4. `app/page.tsx`: placeholder tối thiểu (sẽ thay ở P1T03)
5. `tsconfig.json`: `strict: true` (create-next-app mặc định)
6. Xóa file scaffold thừa: `app/page.module.css` (nếu có), assets mặc định

**Constraints**:
- Tailwind: KHÔNG dùng (giữ CSS custom hiện tại — P1T03 sẽ chuyển)
- `next/image` CẤM tuyệt đối (static export + không runtime optimization — MASTER_PLAN P6)
- KHÔNG xóa index.html cũ (giữ làm nguồn cho P1T03)
- KHÔNG commit

**Definition of Done**:
- `npm run lint` exit 0
- `npx tsc --noEmit` exit 0
- `npm run build` exit 0, sinh ra `out/` (static export)
- `out/index.html` tồn tại
- Không lỗi console khi mở `out/` bằng `python3 -m http.server` + Chrome thật

**Status**: `[x]` — verified 2026-08-14 (Mika): lint/tsc/build PASS, out/ có index.html, title đúng; runner agy viết 3 file, Mika dọn file thừa (page.module.css + 5 svg)

---

### [#P1T03] `app/page.tsx` + `app/globals.css` + components/ — Migrate UI sang components giữ visual parity

**Goal**: Chuyển toàn bộ UI index.html hiện tại (nav/hero/collection/about/services/contact/lightbox/footer + i18n VI/EN) sang Next.js components + global CSS, giữ NGUYÊN visual parity desktop/mobile.

**Depends on**: `[#P1T02]`
**Parallel-safe**: `no`

**Context hiện có**:
- Nguồn: `index.html` (658 dòng) — structure: `<nav id="nav">` (line 300), `.hero` (319, có `#sparks`, `#marqueeTrack`), `#collection` (358), `#about` (397), `.services` (421), `.contact` (450), `#lightbox` (468), `<footer>` (475), `<script>` inline (491-658: `setLang('vi'|'en')`, i18n dict, lightbox, marquee, sparks)
- CSS inline trong `<style>` (dòng ~12-290): tokens `:root` (--bg/--gold/--serif...), `.btn`, `.section`, `.ornament`, `.eyebrow`...
- Ảnh: `assets/img/` (hero-mobile.jpg, hero-B-desktop.jpg, img_00.jpg..img_12.jpg, logo-v2.svg...)

**Concrete changes**:
1. `app/globals.css`: copy TOÀN BỘ `<style>` từ index.html (giữ nguyên tokens + selectors — KHÔNG đổi tên class)
2. `components/Nav.tsx`, `Hero.tsx`, `Collection.tsx`, `About.tsx`, `Services.tsx`, `Contact.tsx`, `Lightbox.tsx`, `Footer.tsx` — server components mặc định; chỉ `Nav` + `Lightbox` + i18n toggle là client (`"use client"` khi cần state/interaction)
3. i18n: chuyển dict VI/EN + `setLang()` + localStorage persistence sang `components/I18nProvider.tsx` (client) — cơ chế giữ NGUYÊN: button `#langVi`/`#langEn`, class `active`, data-lang trên `<html>`
4. `app/page.tsx`: ghép các component theo đúng thứ tự index.html (nav → hero → collection → about → services → contact → lightbox → footer)
5. Public assets: `assets/` → copy vào `public/assets/` (Next static serve) — update mọi `href/src` tương ứng
6. Xóa các file cũ sau khi verify (index.html KHÔNG xóa trong task này — chờ P1T04 verify xong, Mika quyết)

**Constraints**:
- **Visual parity BẮT BUỘC**: giữ nguyên màu (--gold:#d4af37, bg #0a0a0d), font (Playfair Display/Cormorant/Inter), layout, animation hiện có
- KHÔNG đổi nội dung text; KHÔNG thêm UI mới; KHÔNG thêm thư viện (zero-dependency ngoài Next)
- KHÔNG dùng `next/image` — `<img>` thường + `public/` path
- Antipattern cấm: `dangerouslySetInnerHTML` tránh nếu có thể (dùng text nodes); KHÔNG để `window`/`document` trong server component (guard `typeof window !== 'undefined'` hoặc useEffect)
- KHÔNG commit

**Definition of Done**:
- `npm run build` exit 0 (static export ra `out/`)
- Mở `out/` bằng `python3 -m http.server` + Chrome thật (`/usr/bin/google-chrome-stable`): không lỗi console (CDP), toggle VI/EN hoạt động, lightbox click mở ảnh, marquee/sparks chạy
- So sánh visual với bản gốc: screenshot 2 bên (bản cũ = `git show HEAD:index.html` qua http.server, bản mới = out/) — section hero/collection/contact không lệch layout đáng kể

**Status**: `[x]` — verified 2026-08-14 (Mika): lint/tsc/build PASS; browser CDP: DOM match 100% (9 cards, 18 sparks, title, h1), EN/VI toggle + localStorage, lightbox open/close, desktop+mobile screenshot OK, NO_JS_ERRORS

---

### [#P1T04] repo-root CI build ngoài host — GitHub Actions workflow

**Goal**: CI chạy lint/typecheck/build tự động khi push lên GitHub, output artifact `out/` — sẵn sàng deploy TENTEN (build off-host, MASTER_PLAN P1/P7).

**Depends on**: `[#P1T03]` (build phải PASS local trước)
**Parallel-safe**: `no`

**Context hiện có**:
- Repo đã có remote origin (GitHub) — `git remote -v` để xác nhận URL
- Build local đã PASS ở P1T02/P1T03 (`npm run build` → `out/`)

**Concrete changes**:
1. `.github/workflows/build.yml`: trigger `on: push` + `workflow_dispatch`
2. Steps: checkout → setup-node 20 + `npm ci` (hoặc `npm install` nếu chưa có lockfile ổn định) → `npm run lint` → `npx tsc --noEmit` → `npm run build` → `actions/upload-artifact@v4` upload `out/`
3. KHÔNG deploy step trong workflow này (deploy TENTEN là Phase 7 — chỉ build + artifact)
4. Thêm `.gitignore` entries nếu thiếu: `out/`, `.next/`, `node_modules/` (kiểm tra file có sẵn)

**Constraints**:
- KHÔNG thêm secret/credential vào workflow (chưa cần deploy)
- KHÔNG đổi code app — chỉ thêm file CI
- KHÔNG commit

**Definition of Done**:
- `.github/workflows/build.yml` tồn tại, YAML hợp lệ (không lỗi parse — verify bằng `python3 -c "import yaml,pathlib; yaml.safe_load(pathlib.Path('.github/workflows/build.yml').read_text())"` nếu pyyaml có, hoặc ruby/node parse)
- Các bước lint/tsc/build đúng lệnh đã PASS local
- Artifact upload path = `out/` đúng
- KHÔNG thể push để test CI thật (chờ anh báo push) — ghi chú trong report

**Status**: `[ ]`

---

## Phase 2: Supabase Foundation — DB + Auth + Storage + RLS
_(chưa băm task — chờ Phase 1 xong)_

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
