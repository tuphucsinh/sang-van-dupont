# HANDOFF — SangDupont (2026-08-14, phiên 2 — Phase 10-12)

**Trạng thái**: ✅ Phase 10-12 COMPLETE — Sangbot Internal Setup + AI Marketing Pipeline + AI Website Operator. Reviewer PASS (5 góp ý: fix 4 code/doc, còn 1 E2E canary chờ anh test).

**Chạy được**:
- **Sangbot internal** (Telegram @sangdupontbot, chỉ anh — allowlist 6903033581): SOUL Internal Operator (guard push/deploy/delete chờ anh duyệt), toolsets terminal/file/web, gateway active.
- **Marketing**: `npm run marketing -- <slug>` → 8 đầu ra VI/EN vào `marketing/drafts/<slug>/` (verified black-lacquer, 16 calls, không bịa giá). Model deepseek-v4-flash + qwen3.7-plus (opencode-go).
- **Operator**: `npm run ops -- <cmd>` — products CRUD (soft-delete mặc định, hard --force), publish (--confirm + tự backup artifact), links/i18n/seo/smoke/ci/rollback (dry-run). Playbook `.ai/OPERATIONS.md`.

**Chưa push (12 commits)**: gồm fix hreflang SEO (home thêm alternates, Next16 hrefLang camelCase) + toàn bộ Phase 10-12 code. **Chờ anh báo push.**

**Còn mở (không chặn)**:
- B1 shop_policies · B2 giá thật (anh nhập /admin) · B3 GA4 ID (chờ anh) · Research 9B-next
- E2E canary sangbot: anh nhắn "sinh marketing cho black-lacquer" + "xem sản phẩm" 1 lần để xác nhận chuỗi Telegram → lệnh
- gh CLI chưa auth trên Pi5 (sangops ci báo rõ) — `gh auth login` khi cần theo dõi CI tự động

**Ops**: Publish = anh duyệt → `npm run ops -- publish --confirm` (tự backup out/ cũ). Kill AI = `supabase secrets set AI_ENABLED=false`. Backup CN 08:00 tự động.

**Next**: chờ anh — push Phase 10-12 + GA4 ID / giá thật / policies / Research / canary sangbot.
