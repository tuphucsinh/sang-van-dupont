# TASKS — SangDupont WBS

> Quản lý bởi Mika. Runner KHÔNG được sửa file này.
> Format task chuẩn theo AGENTS.md `/plan2task` (8 fields). ID: `[#PxTzz]` (project nhỏ, không milestone).
> MASTERPLAN APPROVED 2026-08-14.

## Phase 1: Foundation — ✅ DONE 2026-08-14
## Phase 2: Supabase Foundation — ✅ DONE 2026-08-14 (Reviewer PASS)
## Phase 3: Catalog + Product Detail — ✅ DONE 2026-08-14
## Phase 4: Admin/CMS — ✅ DONE 2026-08-14 (Reviewer PASS + verify production)
## Phase 5: Lead Pipeline + Telegram — ✅ DONE 2026-08-14 (Reviewer PASS + verify production)
## Phase 6: SEO + GA4 + Performance — ✅ DONE 2026-08-14 (Lighthouse mobile 94 / desktop 100)
_(chi tiết từng phase: `.ai/MASTER_PLAN.md`; task `[x]` đã prune theo RULE 3 sweep)_

## Phase 7: Release A Gate + Deploy Vercel (TENTEN hoãn — D21)

### [#P7T01] Full regression — kỹ thuật + routes + browser

**Goal**: Chạy lại toàn bộ kiểm tra kỹ thuật + browser trên production trước gate: lint/tsc/build sạch, mọi route chính 200, không console errors, VI/EN đúng.

**Depends on**: `none` (verify tổng — Mika tự làm, không dispatch runner)
**Parallel-safe**: `no`

**Context hiện có**: repo sạch, đã deploy Vercel; routes: `/` (home), `/vi/products/[8 slugs]`, `/en/products/[8 slugs]`, `/admin`, `/admin/products`, `/admin/leads`, `/sitemap.xml`, `/robots.txt`

**Concrete changes** (Mika — kiểm tra, KHÔNG sửa code trừ khi phát hiện lỗi):
1. `npm run lint` + `npx tsc --noEmit` + `npm run build` — cả 3 PASS
2. curl tất cả routes production: `/`, 16 product pages, 404 slug lạ (phải 404), `/admin*` (200), sitemap/robots (200)
3. Browser CDP (Chrome thật): home load — NO_JS_ERRORS; mở 1 product VI + 1 EN — title/JSON-LD đúng; mobile viewport render
4. Ghi kết quả từng mục vào `.tmp/regression-p7.md` (tạm — sẽ đưa vào MASTER_PLAN gate)

**Constraints**: KHÔNG sửa code khi đã PASS (chỉ ghi nhận); nếu lỗi → fix task riêng báo Mika
**Definition of Done**: mọi mục PASS — ghi đủ 3 nhóm (kỹ thuật/routes/browser) vào file tạm

**Status**: `[ ]`

---

### [#P7T02] Security regression — RLS + storage + rate limit + secret scan

**Goal**: Xác nhận lại toàn bộ lớp bảo mật còn đúng trên production sau 6 phase (không ai lỏng tay).

**Depends on**: `none` (Mika tự làm — API test)
**Parallel-safe**: `no`

**Context hiện có**: RLS is_admin (P4T01), storage private (P2T04), rate limit 5/h/IP (P5T01), secrets trong .env/.tmp gitignored

**Concrete changes** (Mika):
1. REST test production: anon POST products → 401; anon GET leads → []; anon GET lead-attachments file → 400; service role bypass → 200
2. Rate limit: gửi 6 lead cùng IP fake → lần 6 = 429 (đã verify P5 — chạy lại nhanh 1 lần, dọn data)
3. Secret scan: `git grep -iE 'token|secret|api_key|sbp_|service_role'` → chỉ file hợp lệ (config.toml placeholder, .gitignored); `git ls-files | grep -iE '\.env|token'` → không có file secret tracked
4. Ghi kết quả vào `.tmp/regression-p7.md`

**Constraints**: KHÔNG commit secret; KHÔNG để test data sót (dọn sau mỗi test)
**Definition of Done**: mọi mục PASS + test data sạch

**Status**: `[ ]`

---

### [#P7T03] RELEASE A GATE — 10 tiêu chí (file 1) — checklist PASS/FAIL

**Goal**: Đối chiếu 10 tiêu chí RELEASE A GATE từ file 1, chấm PASS/FAIL từng tiêu chí với bằng chứng (không đoán).

**Depends on**: `[#P7T01]` + `[#P7T02]` (bằng chứng từ regression)
**Parallel-safe**: `no`

**Context hiện có**: file 1 "RELEASE A GATE" — em đã trích vào MASTER_PLAN Phase 7 gate; cần đọc lại file gốc để lấy đủ 10 tiêu chí chính xác: `/home/pi5/projects/Sangwebsite/ke_hoach_nang_cap_sangdupont_tinh_gon(1).md` (tìm section RELEASE A GATE)

**Concrete changes** (Mika):
1. Đọc file 1 → trích chính xác 10 tiêu chí gate
2. Với mỗi tiêu chí: đối chiếu bằng chứng từ P7T01/P7T02 + verify bổ sung nếu thiếu (test nhanh qua API/browser)
3. Ghi bảng PASS/FAIL vào `.ai/MASTER_PLAN.md` mục Phase 7 (bổ sung phần "RELEASE A GATE — kết quả") + `.tmp/regression-p7.md`
4. Nếu có FAIL → KHÔNG đóng gate; báo anh + tạo task fix riêng

**Constraints**: Bằng chứng thật cho mỗi PASS (không "em nghĩ là OK"); FAIL phải nêu rõ thiếu gì
**Definition of Done**: 10/10 PASS ghi vào MASTER_PLAN (kèm bằng chứng ngắn) — nếu <10, dừng báo anh

**Status**: `[ ]`

---

### [#P7T04] Production artifact gọn + backup DB + rollback sẵn sàng

**Goal**: Repo/artifact sạch (không file thừa), backup DB thủ công mới nhất, rollback sẵn sàng (git tag + artifact cũ).

**Depends on**: `none` (Mika tự làm)
**Parallel-safe**: `no`

**Context hiện có**: `scripts/db-backup.sh` (P2T05) giữ 7 bản; git tag `v0.1-pre-migration` cũ; đã deploy nhiều lần Vercel (Vercel giữ deployment history — rollback = promote deployment cũ)

**Concrete changes** (Mika):
1. Kiểm tra repo: `git ls-files` không chứa: `.env*`, `data/`, `preview/`, file backup lớn, node_modules (ignored); dọn file thừa nếu có (đã dọn P1 — verify lại)
2. Backup DB: chạy `scripts/db-backup.sh` → bản mới nhất + verify chứa data (grep product/leads)
3. Git tag release: `git tag v1.0-release-a` tại HEAD hiện tại (sau khi regression PASS) + push tag
4. Ghi rollback quy trình vào `.tmp/regression-p7.md`: (a) code rollback = `git checkout <tag cũ>` + redeploy; (b) DB rollback = restore từ backup file; (c) Vercel = promote deployment trước

**Constraints**: KHÔNG backup DB chứa test data rác (dọn trước); tag chỉ khi regression PASS
**Definition of Done**: repo sạch verify, backup mới + có data, tag v1.0-release-a, rollback doc ghi đủ 3 đường

**Status**: `[ ]`

---

### [#P7T05] Deploy chốt Vercel + smoke production + sweep Phase 7

**Goal**: Deploy bản cuối lên production, smoke test nhanh, đóng Phase 7 + Release A (sweep).

**Depends on**: `[#P7T03]` (gate PASS) + `[#P7T04]`
**Parallel-safe**: `no`

**Concrete changes** (Mika):
1. Push + `vercel --prod` (bản cuối cùng — code không đổi nếu gate PASS, deploy lại để chốt trạng thái)
2. Smoke production: curl home 200 + 1 product + admin 200; browser CDP home NO_JS_ERRORS (nhanh — đã verify kỹ P7T01, chỉ confirm)
3. Cập nhật `.ai/MASTER_PLAN.md`: Phase 7 → ✅ DONE + kết quả gate 10/10 + bảng số liệu (Lighthouse, routes, RLS) + ghi chú Release A COMPLETE
4. `tasks.md`: prune Phase 7 tasks `[x]` theo sweep
5. Commit + push

**Constraints**: Chỉ tuyên bố Release A COMPLETE khi gate 10/10 (P7T03) PASS
**Definition of Done**: production smoke OK, MASTER_PLAN Phase 7 DONE + Release A COMPLETE ghi rõ, repo sạch sync

**Status**: `[ ]`

---

## Phase 8: AI Concierge — Release B
_(chưa băm task — gated: chờ sử dụng thật)_

## Phase 9: Full AI — nội bộ + Vision + Research
_(chưa băm task — gated: chờ ROI Release B)_
