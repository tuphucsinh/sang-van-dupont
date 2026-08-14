# TASKS — SangDupont WBS

> Quản lý bởi Mika. Runner KHÔNG được sửa file này.
> Format task chuẩn theo AGENTS.md `/plan2task` (8 fields). ID: `[#PxTzz]` (project nhỏ, không milestone).
> MASTERPLAN APPROVED 2026-08-14. **RELEASE A COMPLETE 2026-08-14 (Gate 10/10). RELEASE B COMPLETE 2026-08-14 (Gate 4/4).**

## Phase 1: Foundation — ✅ DONE 2026-08-14
## Phase 2: Supabase Foundation — ✅ DONE 2026-08-14 (Reviewer PASS)
## Phase 3: Catalog + Product Detail — ✅ DONE 2026-08-14
## Phase 4: Admin/CMS — ✅ DONE 2026-08-14 (Reviewer PASS + verify production)
## Phase 5: Lead Pipeline + Telegram — ✅ DONE 2026-08-14 (Reviewer PASS + verify production)
## Phase 6: SEO + GA4 + Performance — ✅ DONE 2026-08-14 (Lighthouse mobile 94 / desktop 100)
## Phase 7: Release A Gate + Deploy Vercel — ✅ DONE 2026-08-14 (Gate 10/10 + tag v1.0-release-a)
## Phase 8: AI Concierge — Release B — ✅ DONE 2026-08-14 (Gate 4/4: eval 5/5, policy, handoff E2E, cost cap)
_(chi tiết từng phase: `.ai/MASTER_PLAN.md`; task `[x]` đã prune theo RULE 3 sweep)_

## Phase 9A: Ops hoàn thiện — ✅ DONE (tách 2026-08-14, D22) — chưa băm task
## Phase 9B: Full AI — GATED (chờ usage thật 2-4 tuần + GA4)
_(chưa băm task — gated: chờ ROI Release B; hướng: Vision intake → Admin draft → Research → Recommendation)_

## Vận hành (post-release — không phải phase)
- GA4: code sẵn sàng — chờ anh cấp Measurement ID (G-XXXX) → set env Vercel + rebuild
- Backup: `scripts/db-backup.sh` chạy tay; keepalive cron T7/CN đa-project (kurabe + sangwebsite)
- Publish sản phẩm: /admin thêm/sửa → rebuild + deploy (`vercel --prod`)
- AI chat: kill switch = `supabase secrets set AI_ENABLED=false`; cost cap 100 req/ngày (đổi hằng số + redeploy)
