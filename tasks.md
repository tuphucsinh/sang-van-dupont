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

## Phase 12: AI Website Operator — ✅ DONE 2026-08-14 (P12T01-06 + Reviewer PASS + 5 góp ý đã fix 4; còn E2E canary chờ anh test Telegram)

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

