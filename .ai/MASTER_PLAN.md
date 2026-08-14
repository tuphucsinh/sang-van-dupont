# MASTER PLAN — SangDupont (Sangwebsite)

> Status: **APPROVED 2026-08-14 (anh duyệt)** — Phase 1 đã plan2task, sẵn sàng `/do`
> Created: 2026-08-14 · Author: Mika
> Nguồn: `ke_hoach_nang_cap_sangdupont_tinh_gon(1).md` (713 dòng) + `sangdupont_ai_hermes_capabilities.md` (413 dòng)
> Workflow: AGENTS.md chuẩn — Mika plan/verify → Runner implement → Reviewer khi chạm auth/DB/backend/production

---

## 0. GOAL & BOUNDARIES

**Mục tiêu tổng thể**: Nâng landing page static hiện tại (`sangdupont.vercel.app`) thành website công ty/bán hàng nhỏ có catalog, quản trị sản phẩm, lead pipeline, SEO và AI mở rộng được — **static-first, compute offload, build off-host, không Node thường trực khi chưa cần**.

**In-scope**:
- Chuyển UI hiện tại sang Next.js + TypeScript, giữ visual parity đen-vàng luxury
- Static export (`output: 'export'`) + build ngoài host (GitHub Actions/PC) → TENTEN
- Supabase Free: DB (products/leads/...), Auth (admin), Storage (media), Edge Functions (Telegram/AI proxy)
- Catalog + product detail + admin/CMS tối giản + lead pipeline + SEO/tracking/performance (Release A)
- AI concierge public (Release B, khi có sử dụng thật)
- Hermes làm AI operating layer nội bộ (content/CMS, website operator) — chạy ngoài website

**Out-of-scope (Release A, theo file nguồn §11)**:
- Checkout online, marketplace, app mobile, realtime dashboard, Redis, vector DB/RAG lớn, voice/avatar AI
- AI tự đăng bài, AI tự định giá/xác thực thật-giả, nhiều tầng admin role
- SSR toàn site chỉ vì Next.js hỗ trợ; runtime image optimization trên shared hosting

**Ràng buộc chốt (từ 2 file kế hoạch)**:
1. Static-first: RAM/CPU/disk TENTEN tối thiểu; database/media/AI không ăn tài nguyên hosting
2. Không để API key/secret trong trình duyệt — mọi sensitive action qua Edge Function
3. Không đưa AI public trước khi catalog + lead pipeline đủ chuẩn (file 1 mục tiêu #6)
4. Nguồn sự thật canonical cho sản phẩm/giá/tình trạng; Hermes MEMORY không làm CRM/giá/tồn kho
5. Public Hermes (Telegram concierge) tối thiểu quyền; internal Hermes mới có quyền code/git
6. Research chỉ truy cập nguồn công khai/được phép; lưu URL + timestamp

---

## 1. PHASES

### Phase 1: Foundation — Repo chuẩn hóa + Next.js/TS migration — ✅ DONE 2026-08-14
**Kết quả thực thi**: repo chuẩn hóa (`.ai/` + tasks.md + HANDOFF + .tmp gitignored); tag `v0.1-pre-migration` + backup tar.gz 20.8MB (hermes-artifacts); dọn 28 asset thừa + data/preview ra ngoài; Next.js App Router + TS strict + `output:'export'` (lint/tsc/build PASS); migrate toàn bộ UI sang 12 components giữ visual parity (CDP verify: DOM match 100%, EN/VI toggle + localStorage, lightbox, desktop+mobile screenshots, NO_JS_ERRORS); CI GitHub Actions build off-host (7 steps, chờ push thật). Runner: agy (P1T02/03) + Mika direct (P1T01 ops, P1T04 sau 2 lần agy fail 503).

**Deliverables**:
- Backup repo trước khi dọn/migration (git tag/archive — file 1 §13 bước 1)
- Cấu trúc chuẩn hoạt động: `.ai/`, `tasks.md`, `HANDOFF.md`, `.tmp/`, gitignore đầy đủ
- Next.js App Router + TS (strict), component hóa tối thiểu, Client Component chỉ khi cần tương tác
- `output: 'export'`, build sạch, không lỗi console nghiêm trọng
- Dọn repo: data/ (đã ignore), preview/, asset thừa (logo variants, hero-B*), file kế hoạch giữ ở docs/
- CI build ngoài host (GitHub Actions) — chuẩn bị cho deploy TENTEN

**Dependencies**: `none` (bắt đầu từ landing hiện tại)
**Gate**: build sạch; visual parity desktop/mobile; không regression đáng kể; lint/typecheck PASS

### Phase 2: Supabase Foundation — DB + Auth + Storage + RLS — ✅ DONE 2026-08-14
**Kết quả thực thi**: CLI 2.114 + link project `sangwebsite` (ACTIVE_HEALTHY, PG17, ap-northeast-1); `.env.local` gitignored (anon/service key, chmod 600); 3 migration applied: schema core (9 bảng + 2 enum + 8 index) → RLS (9 bảng enable, public chỉ đọc available, leads/attachments private, không public write) → storage (product-images public read + admin write, lead-attachments private); seed `[SEED]` 2 products + faq + testimonial + lead; `scripts/db-backup.sh` (backup thủ công, giữ N bản). **Verify thật**: anon đọc 2 available/ẩn draft, anon leads [], anon INSERT 401, service role full; storage anon upload 400, anon download lead 400, service 200. **Reviewer PASS** (SW-P2-MIGRATIONS-01) + 3 góp ý ghi nhận DECISIONS_LOG (R1 role admin chuyên biệt Phase 4, R2 site_settings không chứa secret, R3 seed case_studies Phase 3). Lưu ý: tắt public signup = thao tác UI dashboard (chưa làm — chờ Phase 4 khi có admin thật).

**Deliverables**:
- Tables: `products`, `product_media`, `services`, `testimonials`, `case_studies`, `faq`, `leads`, `lead_attachments`, `site_settings` (+ `ai_conversations` khi Release B)
- RLS bắt buộc cho bảng exposed; Auth admin-only, tắt public signup
- Storage: product images public (tối ưu WebP/AVIF trước upload), lead attachments **private**
- Index: `slug`, `status`, `created_at`
- Migration replay được; backup thủ công định kỳ (Free không có auto-backup)

**Dependencies**: Phase 1
**Gate**: RLS test PASS (public không đọc được lead/private media); admin CRUD test; migration từ bản sạch chạy được

### Phase 3: Catalog + Product Detail — ✅ DONE 2026-08-14
**Kết quả thực thi**: seed 9 sản phẩm thật (8 available + 1 reserved, tên từ landing, price NULL="Liên hệ", D17) + 16 media rows; `@supabase/supabase-js` + `lib/supabase.ts` + `lib/catalog.ts` (fetch build-time SSG, guard thiếu env → [], D14); Collection render từ data thật (8 card + badge + link detail); Product detail `/vi/products/[slug]` + `/en/products/[slug]` — SSG 16 trang, metadata/OG + hreflang, JSON-LD (không bịa price), gallery, similar 3, CTA Zalo/Telegram/Call. **Verify thật**: tsx test PASS, build PASS, browser CDP VI/EN render + NO_JS_ERRORS, 404 slug lạ, Chrome sạch sau test. Ghi chú: ảnh serve static (D15); reserved ẩn khỏi public đúng RLS (badge "Đã giữ" sẽ hoạt động khi Phase 4 có admin đổi status).

**Deliverables**:
- Product fields đầy đủ: id/slug, tên/mã, dòng, chất liệu, năm/thời kỳ, tình trạng, mô tả VI/EN, giá hoặc "Liên hệ", status `draft/available/reserved/sold/archived`, cover + gallery
- Lọc cơ bản + tìm kiếm client-side + badge trạng thái + CTA hỏi đúng sản phẩm
- Product detail: URL riêng VI/EN, gallery, video nếu có, metadata/OG, structured data, CTA Zalo/Telegram/call, similar products (filter đơn giản)
- Chiến lược render: static tại build (catalog nhỏ, thay đổi ít); không ISR

**Dependencies**: Phase 2
**Gate**: 100% sản phẩm published có slug/cover/status/metadata hợp lệ; VI/EN URL hoạt động

### Phase 4: Admin/CMS tối giản
**Goal**: Admin CRUD sản phẩm + nội dung + xem lead qua Supabase Auth + RLS.

**Deliverables**:
- Login admin (Supabase Auth)
- CRUD sản phẩm (VI/EN), upload/sắp xếp ảnh, đổi trạng thái
- FAQ/testimonial/case study cơ bản; xem lead
- Publish flow: lưu Supabase → publish → trigger rebuild/deploy → public site nhận dữ liệu mới (thủ công bước đầu, tự động khi tần suất tăng)

**Không làm**: multi-role, workflow duyệt nhiều cấp, audit log lớn, realtime dashboard
**Dependencies**: Phase 2
**Gate**: admin CRUD test PASS; public không thể write qua RLS

### Phase 5: Lead Pipeline + Telegram Edge Function
**Goal**: Form tư vấn mua + bảo dưỡng; lead vào DB; notification Telegram; ảnh khách private.

**Deliverables**:
- Form tư vấn mua: ngân sách, nhu cầu, dòng quan tâm, tên, ĐT/Zalo, kênh
- Form bảo dưỡng: mô tả vấn đề, ảnh, liên hệ, consent xử lý dữ liệu
- Flow: Browser → Turnstile/validation → Edge Function (lưu lead + mã yêu cầu + kiểm soát upload + gửi Telegram)
- Không để Telegram token/service-role key ở client

**Dependencies**: Phase 2
**Gate**: lead hợp lệ được lưu + notification hoạt động; ảnh khách private; spam bị chặn

### Phase 6: SEO + Tracking + Performance
**Goal**: Chuẩn hóa SEO song ngữ, GA4 tối thiểu, tối ưu performance static.

**Deliverables**:
- `/vi/...`, `/en/...`, canonical, hreflang, sitemap, robots, OG, structured data, semantic HTML
- GA4 events: `view_product`, `click_zalo`, `click_telegram`, `click_call`, `start_form`, `submit_form`, `qualified_lead`
- Ảnh WebP/AVIF pre-optimize, srcset/sizes, lazy-load dưới fold, `prefers-reduced-motion`, giảm JS bundle
- Không runtime `next/image` optimization trên TENTEN

**Dependencies**: Phase 3 + Phase 5 (GA4 events `start_form`/`submit_form`/`qualified_lead` cần form từ P5)
**Gate**: Lighthouse mobile Perf ≥ 85, desktop ≥ 90; A11y/SEO/BP ≥ 90

### Phase 7: Release A Gate + Deploy TENTEN
**Goal**: Full regression + production artifact gọn + deploy TENTEN + rollback sẵn sàng.

**Deliverables**:
- Full regression: typecheck/lint/build, route/404/VI-EN, admin CRUD, RLS, private storage, lead/Telegram, analytics, mobile/desktop
- Production artifact: không chứa `.git`, `node_modules`, `.next/cache`, preview, crawl data, backup lớn
- Deploy TENTEN (static export) + smoke test; giữ artifact cũ để rollback; backup DB thủ công
- Quyết định host chờ anh chốt: hiện đang Vercel live — TENTEN target theo kế hoạch (xem OPEN DECISIONS)

**Dependencies**: Phase 1–6
**Gate**: RELEASE A GATE (file 1 "RELEASE A GATE" — 10 tiêu chí) đủ — chỉ production khi tất cả PASS

### Phase 8: AI Concierge — Release B (khi có sử dụng thật)
**Goal**: AI public qua Edge Function proxy + tool calling; Hermes Telegram concierge restricted; lead/CRM nhẹ.

**Deliverables**:
- AI chat UI trên website → Supabase Edge Function/lightweight API → AI provider → validated tools (search products, get product state, create lead/handoff)
- AI guard: rate limit, quota/session, token cap, bot protection, timeout, log usage, cost cap, kill switch, eval cố định
- Hermes restricted profile (Telegram): product lookup read-only, FAQ/service, vision intake, create lead, human handoff — **không** shell/filesystem/git/web tự do
- Lead/CRM: status `new → contacted → qualified → won/lost`, follow-up nhắc
- Chuẩn hóa dữ liệu/policy cho AI trước (file 1 bước 11)

**AI không được**: bịa sản phẩm/giá/tồn kho, khẳng định thật/giả, tự chốt giá, cam kết bảo hành/thời gian sửa, tự sửa production data
**Dependencies**: Phase 7 + sử dụng thật
**Gate**: không giới thiệu sản phẩm không tồn tại/không bán; policy thật/giả/giá hoạt động; handoff end-to-end PASS; cost cap hoạt động

### Phase 9: Full AI — AI nội bộ + Vision + Research (theo ROI)
**Goal**: Chỉ triển khai khi Release B có sử dụng thật (file 1 §6): AI nội bộ trong admin, vision intake, market/sourcing research.

**Deliverables**:
- AI nội bộ: draft mô tả VI/EN, caption, alt text, tóm tắt tình trạng, draft case study — **AI chỉ tạo draft, admin duyệt trước publish**
- AI vision: "Trợ lý tiếp nhận và đánh giá hình ảnh sơ bộ" — kiểm tra thiếu góc, mô tả đặc điểm, yêu cầu ảnh bổ sung; **không** xác nhận thật/giả, định giá cuối, thay chuyên gia
- Research (giá trị cao nhất): sourcing, seller/competitor watchlist, price intelligence, opportunity alerts — Research DB riêng (seller/listing/price/watchlist), URL+timestamp
- Marketing pipeline: một nguồn dữ liệu → listing/bài/FB/TikTok/EN/SEO/alt
- Recommendation (gợi ý sản phẩm): filter deterministic chọn candidate, AI chỉ giải thích — không cho model tự chọn ngoài dữ liệu thật (file 1 §6.3)
- Hardening: usage/cost/kill switch hoàn chỉnh, disclaimer, human-review gate, audit an toàn

**Dependencies**: Phase 8
**Gate**: upload/private storage PASS; disclaimer rõ; human review kết luận quan trọng; usage/cost/kill switch PASS

---

## 2. THỨ TỰ THỰC HIỆN (file 1 §13 — map sang phases)

| Bước nguồn | Phase |
|---|---|
| 1–3: Backup/dọn repo → Next.js/TS → static export + CI | P1 |
| 4: Supabase Free + RLS/Auth/Storage | P2 |
| 5–8: Catalog → Admin → Lead/Telegram → SEO/perf | P3–P6 |
| 9–10: Regression + deploy → **Release A production** | P7 |
| 11–13: Chuẩn hóa data/policy AI → concierge → **Release B** | P8 |
| 14–16: Đo usage → AI nội bộ/vision khi ROI rõ → **Full AI** | P9 |

---

## 3. OPEN DECISIONS (hỏi anh khi tới phase)

1. **Host**: hiện Vercel live; kế hoạch target TENTEN — giữ Vercel tới khi TENTEN sẵn sàng, hay chuyển sớm? (Phase 7)
2. **Domain**: giữ `sangdupont.vercel.app` hay mua domain riêng (SEO)? (Phase 6–7)
3. **GA4**: tài khoản Analytics có sẵn hay tạo mới? (Phase 6)
4. **Turnstile**: dùng Cloudflare Turnstile Free cho form — xác nhận? (Phase 5)
5. **Telegram**: bot token dùng `sangdupontbot` hiện có (đã gắn live chat)? (Phase 5)
6. **Scope triển khai**: chỉ lên kế hoạch Release A (P1–P7) hay bao gồm cả Release B AI (P8)? (ảnh hưởng plan2task scope)

---

## 4. TOP 3 RỦI RO + KIỂM SOÁT (file 1 §14)

| Rủi ro | Kiểm soát |
|---|---|
| 1. Static publishing = thêm bước rebuild khi publish | Catalog nhỏ → rebuild/deploy chấp nhận được; tự động hóa khi tần suất tăng; không ISR |
| 2. Supabase Free pause / thiếu backup tự động | Backup thủ công định kỳ; đo usage; nâng Pro khi uptime/backup thành yêu cầu kinh doanh |
| 3. AI/media tăng chi phí + abuse | Media ở Storage; AI ngoài TENTEN; quota/rate limit/Turnstile/kill switch |

---

## 5. QUY TRÌNH VẬN HÀNH (project)

- Git: commit tự động 1 task = 1 commit `[#PxTzz]`; **không push tự động** — push khi anh báo
- Reviewer (CONTROLLED) bắt buộc khi chạm: auth/DB/schema/backend/production — mọi phase từ P2 trở đi
- Browser verify bắt buộc gate milestone frontend (Chrome thật, CDP)
- 2-Strike: lỗi tái diễn ≥ 2 lần → thu bằng chứng vận hành thật trước khi fix tiếp
