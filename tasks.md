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
_(chưa băm task — gate: anh yêu cầu + usage thật; hướng: Research DB riêng + opportunity alerts + marketing pipeline)_

## Vận hành (post-release — không phải phase)
- GA4: code sẵn sàng — chờ anh cấp Measurement ID (G-XXXX) → set env Vercel + rebuild
- Backup: cron CN 08:00 (ping + backup sangwebsite giữ 7 bản); T7 21:00 ping thuần; KURABE backup tắt (chờ link)
- Publish sản phẩm: /admin thêm/sửa → rebuild + deploy (`vercel --prod`)
- AI chat: kill switch = `supabase secrets set AI_ENABLED=false`; cost cap 100 req/ngày
- AI vision: model qwen3.7-plus (AI_VISION_MODEL secret — chốt 14-08: thận trọng hơn qwen3.8-max); draft chỉ nháp — anh duyệt trước save
