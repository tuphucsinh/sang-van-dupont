# TASKS — SangDupont WBS

> Quản lý bởi Mika. Runner KHÔNG được sửa file này.
> Format task chuẩn theo AGENTS.md `/plan2task` (8 fields). ID: `[#PxTzz]` (project nhỏ, không milestone).
> MASTERPLAN APPROVED 2026-08-14. **RELEASE A COMPLETE (Gate 10/10). RELEASE B COMPLETE (Gate 4/4). PHASE 9B COMPLETE 2026-08-14.**

## Phase 1: Foundation — ✅ DONE 2026-08-14
## Phase 2: Supabase Foundation — ✅ DONE 2026-08-14 (Reviewer PASS)
## Phase 3: Catalog + Product Detail — ✅ DONE 2026-08-14
## Phase 4: Admin/CMS — ✅ DONE 2026-08-14 (Reviewer PASS + verify production)
## Phase 5: Lead Pipeline + Telegram — ✅ DONE 2026-08-14 (Reviewer PASS + verify production)
## Phase 6: SEO + GA4 + Performance — ✅ DONE 2026-08-14 (Lighthouse mobile 94 / desktop 100)
## Phase 7: Release A Gate + Deploy Vercel — ✅ DONE 2026-08-14 (Gate 10/10 + tag v1.0-release-a)
## Phase 8: AI Concierge — Release B — ✅ DONE 2026-08-14 (Gate 4/4)
## Phase 9A: Ops hoàn thiện — ✅ DONE (tách 2026-08-14, D22)
## Phase 9B: Full AI (Vision + Admin draft + Recommend) — ✅ DONE 2026-08-14 (qwen3.7-plus vision — chốt sau so sánh 2 model)
_(chi tiết từng phase: `.ai/MASTER_PLAN.md`; task `[x]` đã prune theo RULE 3 sweep)_

## Phase 9B-next: Research (sourcing/price intelligence) — khi anh muốn
_(chưa băm task — gate: anh yêu cầu + usage thật; hướng: Research DB riêng + opportunity alerts + marketing pipeline; marketing pipeline đã tách sang Phase 11 — 14-08)_

## Phase 10: Sangbot Internal Setup — ✅ DONE 2026-08-14 (SOUL internal + toolsets + pairing chỉ anh + gateway Telegram connected; anh test chat khi tiện)

## Phase 11: AI Marketing Pipeline — ✅ CODE DONE 2026-08-14 (P11T01-04; P11T03 generator verified với black-lacquer — xem marketing/drafts/; Reviewer không bắt buộc — không chạm backend/production)

## Phase 12: AI Website Operator — ✅ CODE DONE 2026-08-14 (P12T01-06; **chờ Reviewer gate** — chạm DB write + production)

### [#P10T01] [sangbot/SOUL.md] Backup + SOUL internal operator mới

**Goal**: Chuyển SOUL sangbot từ public concierge RESTRICTED → internal operator (được terminal/file/git/web nhưng guard: push/deploy/delete = chờ anh duyệt), có backup khôi phục được.
**Depends on**: `none`
**Files**: `/home/pi5/.hermes/profiles/sangbot/SOUL.md` (+ `SOUL.md.bak-p10`), `.ai/AI_POLICY.md` (tham chiếu)
**Steps**: (1) Backup SOUL.md → SOUL.md.bak-p10 + config.yaml → hermes-artifacts; (2) Viết SOUL.md mới: internal operator persona — quyền terminal/file/git/web, guard cứng (push/deploy/delete chờ anh duyệt qua Telegram; không bịa data; tuân thủ AI_POLICY Internal + OPERATIONS.md P12); (3) Ghi chú chuyển vai trò D26 (khách không dùng Telegram bot).
**Contract**: SOUL mới giữ cấm bịa data; thêm guard approval; bỏ vai public concierge.
**Tests**: backup tồn tại; SOUL mới đọc lại đủ guard keywords (push/deploy/delete → chờ anh).
**Verify**: `ls SOUL.md.bak-p10` + grep guard trong SOUL.md.
**Stop**: SOUL mới + backup OK → report. (Mika direct — chạm profile, không giao runner)

### [#P10T02] [sangbot config/toolsets] Mở toolsets + pairing chỉ approve anh

**Goal**: sangbot có terminal/file/web/git; chỉ anh chat được với bot (user khác bị chặn).
**Depends on**: `[#P10T01]`
**Files**: `~/.hermes/profiles/sangbot/config.yaml`, pairing store sangbot, hermes CLI tools
**Steps**: (1) `hermes --profile sangbot tools enable terminal file web git` (per platform telegram) → verify `hermes tools list`; (2) Cấu hình DM authorization/pairing: approve Telegram user của anh; (3) Kiểm tra config gateway: bot @sangdupontbot không còn chế độ public, không allowlist user lạ.
**Contract**: user ngoài allowlist → bị chặn hoàn toàn.
**Tests**: tools list có 4 toolsets; pairing list chỉ 1 user (anh).
**Verify**: như Tests + grep config không còn public mode.
**Stop**: toolsets + pairing đúng → report. (Mika direct)

### [#P10T03] [sangbot gateway] Bật gateway + verify E2E

**Goal**: gateway sangbot online; anh nhắn Telegram → sangbot phản hồi + chạy được tool cơ bản; user lạ không vào.
**Depends on**: `[#P10T02]`
**Files**: sangbot gateway (hermes gateway start — GUARD: bật/restart gateway do anh chạy tay hoặc approve trước)
**Steps**: (1) Anh bật gateway sangbot (hoặc approve Mika bật); (2) Verify online (status); (3) Anh chat thử → sangbot chạy 1 tool read-only (vd đọc product) → phản hồi; (4) Verify user lạ bị chặn (nếu test được).
**Tests**: gateway active; 1 message round-trip thật.
**Verify**: gateway status + kết quả chat thật.
**Stop**: online + round-trip OK → report.

## Phase 11: AI Marketing Pipeline — PLAN (chờ /do)

### [#P11T01] [scripts/marketing/load-product.ts] Data loader từ Supabase

**Goal**: Load 1 sản phẩm (slug) + media từ Supabase (service role) → JSON chuẩn cho generator; không leak secret.
**Depends on**: `none` (data P3 sẵn)
**Files**: `scripts/marketing/load-product.ts`, `package.json` (thêm `tsx` devDep + script)
**Steps**: (1) `npm i -D tsx`; (2) Script dùng @supabase/supabase-js + `SUPABASE_SERVICE_ROLE_KEY` (.env.local); (3) Input slug → output product JSON; (4) Validate: chỉ `available`/`reserved` (không draft/sold/archived cho marketing), price nullable.
**Contract**: `MarketingProduct { slug, nameVi, nameEn, line, material, year, condition, descVi, descEn, price: number|null, status, media: {url, kind, sortOrder}[] }`
**Tests**: chạy 1 slug thật → JSON đủ fields; slug lạ → error rõ ràng.
**Verify**: `npx tsx scripts/marketing/load-product.ts <slug>` + grep output không chứa secret.
**Stop**: loader OK → report.

### [#P11T02] [marketing/templates/] Prompt templates 8 đầu ra VI/EN

**Goal**: 8 templates chuẩn (listing, bài web, FB post, TikTok caption, story/reel, SEO meta, alt text — mỗi loại VI+EN), persona luxury đen-vàng, guard không bịa.
**Depends on**: `[#P11T01]`
**Files**: `marketing/templates/*` (8 file hoặc 1 module TS)
**Steps**: (1) Viết template từng loại: tone luxury, CTA Zalo/Telegram, hashtag, disclaimer; (2) Guard: price null → "Liên hệ 0905 076 886", không thêm năm/thông số/tình trạng ngoài data; (3) SEO meta: title ≤ 60, desc ≤ 155, OG fields.
**Contract**: mỗi template nhận `MarketingProduct` → trả text (hoặc object cho SEO/alt).
**Tests**: review: không placeholder bịa; price null xử lý đúng; độ dài meta đúng.
**Verify**: đọc templates + checklist guard.
**Stop**: 8 templates đủ → report.

### [#P11T03] [scripts/marketing/generate.ts] Generator 8 đầu ra + vision alt text

**Goal**: Gọi opencode-go (text deepseek-v4-flash + vision qwen3.7-plus) → sinh đủ 8 đầu ra VI/EN → lưu `marketing/drafts/<slug>/` (md + seo.json + alt.txt), log cost.
**Depends on**: `[#P11T02]`
**Files**: `scripts/marketing/generate.ts`, `marketing/drafts/` (git-tracked), opencode-go key (env — KHÔNG vào git)
**Steps**: (1) CLI `generate <slug>`: load product → vision từng ảnh (alt text, reuse pattern 9B) → text 8 đầu ra; (2) Write: `listing-vi.md, listing-en.md, web-vi.md, web-en.md, facebook-vi.md, facebook-en.md, tiktok-vi.md, tiktok-en.md, story-vi.md, story-en.md, seo.json, alt.txt`; (3) Log số lượt gọi/token ra stdout + `.tmp/marketing-log.md`.
**Contract**: output files theo danh sách trên; seo.json: `{slug, titleVi, titleEn, descVi, descEn, ogImage}`; alt.txt: `url → alt` từng ảnh.
**Tests**: chạy 1 sản phẩm thật → đủ file; grep không thấy giá bịa (price null → không có số tiền); cost log in ra.
**Verify**: `ls marketing/drafts/<slug>/` + kiểm tra nội dung 2-3 file.
**Stop**: generator chạy đủ + đúng guard → report kèm chi phí thực.

### [#P11T04] [docs] Hướng dẫn dùng + cập nhật AI_FEATURES_GUIDE

**Goal**: Anh/sangbot dùng được pipeline; tài liệu khớp thực tế.
**Depends on**: `[#P11T03]`
**Files**: `.ai/AI_FEATURES_GUIDE.md` (mục Marketing), `marketing/README.md`
**Steps**: (1) README: câu lệnh qua sangbot ("sinh marketing cho <slug>"), nơi review (`git diff marketing/drafts/`), cách publish (dán admin / sangops P12); (2) AI_FEATURES_GUIDE thêm mục 4️⃣ Marketing Pipeline.
**Tests**: đọc lại khớp command thật.
**Verify**: 2 file tồn tại + nội dung đúng.
**Stop**: docs OK → report.

## Phase 12: AI Website Operator — PLAN (chờ /do)

### [#P12T01] [.ai/OPERATIONS.md] Playbook vận hành + rollback

**Goal**: Tài liệu chuẩn: post-deploy checklist, xử lý deploy lỗi → nguyên nhân, rollback 3 đường (kế thừa P7), guard approval push/deploy/delete.
**Depends on**: `none`
**Files**: `.ai/OPERATIONS.md` (mới), rollback doc P7 (tìm trong repo — docs/ hoặc .ai/)
**Steps**: (1) Tìm doc rollback P7 ("3 đường") → kế thừa; (2) Viết playbook: checklist post-deploy, phân loại lỗi (build/test/deploy/runtime), guard approval; (3) Tham chiếu từ SOUL sangbot (P10).
**Tests**: review: đủ checklist + guard; không mâu thuẫn AGENTS.md.
**Verify**: file tồn tại + nội dung đầy đủ.
**Stop**: playbook OK → report. (Mika direct — docs)

### [#P12T02] [scripts/ops/sangops.ts] CLI skeleton + env + logger

**Goal**: Khung CLI `sangops` (subcommands, load .env.local, log timestamp, help); `npm run ops`.
**Depends on**: `[#P12T01]`
**Files**: `scripts/ops/sangops.ts`, `package.json` (scripts.ops = `tsx scripts/ops/sangops.ts`), `scripts/ops/README.md`
**Steps**: (1) parseArgs subcommands; (2) registry `products|links|i18n|seo|smoke|ci|publish|rollback`; (3) env load (.env.local — không in secret); (4) logger → `.tmp/ops.log` (gitignored) + stdout.
**Contract**: `sangops <cmd> [args]`; lệnh lạ → exit 1 + usage.
**Tests**: `npx tsx scripts/ops/sangops.ts --help` liệt kê đủ subcommands; lệnh lạ → error rõ.
**Verify**: help chạy + không in secret.
**Stop**: skeleton chạy → report.

### [#P12T03] [sangops products+publish] CRUD product + publish (service role + vercel --prod)

**Goal**: `products list|get|create|update|delete` (service role, delete confirm 2 bước) + `publish` = `vercel --prod` (reuse vận hành hiện tại).
**Depends on**: `[#P12T02]`
**Files**: `scripts/ops/products.ts`, `scripts/ops/publish.ts` (+ wire sangops)
**Steps**: (1) CRUD qua supabase-js service role (RLS bypass — internal); validate slug/fields/status enum; (2) delete: phải gõ lại slug (confirm 2 bước); (3) publish: exec `vercel --prod` (cwd project) + log output; (4) Log mọi write vào `.tmp/ops.log`.
**Contract**: status ∈ draft/available/reserved/sold/archived; delete chỉ khi confirm đúng slug.
**Tests**: create draft → list/get → update → delete (test data, dọn sạch sau); publish: dry-run hiển thị lệnh (không deploy thật trong test).
**Verify**: query lại DB xác nhận thay đổi; test data sạch; không leak secret.
**Stop**: CRUD + publish verified → report.

### [#P12T04] [sangops check] links + i18n + seo audits

**Goal**: `links` (crawl sitemap → link/img hỏng), `i18n` (VI/EN lệch từ DB), `seo` (title/desc/canonical/hreflang/OG/JSON-LD/alt per-page).
**Depends on**: `[#P12T02]`
**Files**: `scripts/ops/links.ts`, `scripts/ops/i18n.ts`, `scripts/ops/seo.ts` (+ wire)
**Steps**: (1) links: fetch `sitemap.xml` production → mọi URL + img src → HTTP status → report broken (kèm URL + status); (2) i18n: query products/services/faq so sánh VI vs EN (empty/lệch đáng kể); (3) seo: per-page fetch → parse title/desc/canonical/hreflang/OG/JSON-LD/alt → checklist report.
**Tests**: chạy trên production thật → report; 0 false positive trên 2 trang chuẩn (verify tay).
**Verify**: output từng subcommand đúng định dạng, exit 0.
**Stop**: 3 audits verified → report.

### [#P12T05] [sangops smoke+ci+rollback] Post-deploy check + GH Actions + rollback prep

**Goal**: `smoke` (HTTP routes + CDP NO_JS_ERRORS + sitemap/robots valid), `ci` (gh run list/watch/log-failed), `rollback` (dry-run kế hoạch, thực thi sau anh duyệt).
**Depends on**: `[#P12T03]`
**Files**: `scripts/ops/smoke.ts`, `scripts/ops/ci.ts`, `scripts/ops/rollback.ts` (+ wire)
**Steps**: (1) smoke: fetch các route chính (/, /vi, /en, /vi/products, 1 product, /admin, 404) + Chrome CDP NO_JS_ERRORS (pattern P7) + sitemap/robots 200; (2) ci: `gh run list -L5`, `gh run view <id> --log-failed` → trạng thái + nguyên nhân; (3) rollback: dry-run mặc định — in kế hoạch (git revert / redeploy artifact cũ / backup DB) — thực thi chỉ khi anh duyệt.
**Tests**: smoke PASS production; ci hiển thị run thật; rollback dry-run in đúng kế hoạch.
**Verify**: output từng subcommand + exit 0.
**Stop**: 3 subcommands verified → report.

### [#P12T06] [AI_POLICY.md + sangbot] Internal AI policy + command map cho sangbot

**Goal**: AI_POLICY có mục Internal (marketing/operator chỉ data thật, write log + reversible, guard approval); sangbot dùng được sangops qua Telegram (read-only an toàn).
**Depends on**: `[#P12T05]`
**Files**: `.ai/AI_POLICY.md` (append Internal — D29), `sangbot/SOUL.md` (đồng bộ guard)
**Steps**: (1) Append mục Internal AI Policy; (2) Kiểm tra SOUL sangbot guard khớp (push/deploy/delete chờ anh); (3) Command map: anh nhắn sangbot "check site" → smoke, "audit seo" → seo, "kiểm tra VI/EN" → i18n, "sinh marketing cho X" → P11; (4) Test 1 lượt chat read-only qua sangbot.
**Tests**: policy append đúng; 1 lượt chat thật gọi sangops read-only thành công.
**Verify**: đọc lại policy + SOUL; kết quả chat thật.
**Stop**: policy + wire verified → report.

**GATE Phase 12**: tất cả task xong → **Reviewer gate bắt buộc** (chạm DB write + production) trước khi DONE.

## Vận hành (post-release — không phải phase)
- GA4: code sẵn sàng — chờ anh cấp Measurement ID (G-XXXX) → set env Vercel + rebuild
- Backup: cron CN 08:00 (ping + backup sangwebsite giữ 7 bản); T7 21:00 ping thuần; KURABE backup tắt (chờ link)
- Publish sản phẩm: /admin thêm/sửa → rebuild + deploy (`vercel --prod`)
- AI chat: kill switch = `supabase secrets set AI_ENABLED=false`; cost cap 100 req/ngày
- AI vision: model qwen3.7-plus (AI_VISION_MODEL secret — chốt 14-08: thận trọng hơn qwen3.8-max); draft chỉ nháp — anh duyệt trước save
