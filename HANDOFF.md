# HANDOFF — SangDupont (2026-08-16, phiên chốt — Refactor 3 đợt + security + production xanh)

**Trạng thái**: ✅ COMPLETE — Refactor toàn diện 3 đợt (ZCode plan → agy thực hiện + review). Production live, main pushed `16f3fec`. Bài học phiên đã gộp vào skill `static-website-supabase` v1.1.0 (Refactor & Hardening + pitfalls 10-15).

## Đã hoàn tất hôm nay
1. **Refactor đợt 1** (main `107cad7`): i18n render theo lang (bỏ DOM swap data-i18n), metadata theo ngôn ngữ, Zalo đúng số, build guard chống site rỗng, video reduced-motion, LeadForm 3MB, React.cache + singleton, SEO (canonical/sitemap), nav Link, Lightbox, not-found. Browser verify /vi + /en + product 100%.
2. **Refactor đợt 2** (main `04855d1`): security edge functions — vision-intake kill switch + JWT admin draft/translate, rate limit lead_summary/chat_photo, escapeHtml Telegram, sanitize kw, log no choice. Review agy + fixes (insert log action, escape & URL, giữ dấu chấm kw).
3. **Refactor đợt 3** (main `e70e127`): R16 gộp supabase client modules, R17 ADMIN_EMAILS 1 hằng số (lib/admin.ts), R15 is_admin theo auth.uid allowlist (migration `20260816170000_admin_uid_allowlist.sql` đã deploy — anon read OK, INSERT chặn 42501). R2b verify: html lang client-side + metadata đủ (route group bất khả thi Next 16).
4. **Sự cố đã xử lý**: ai-chat 502 (AI_API_KEY Supabase cũ → set key mới shared.env); model vision qwen chết upstream → `AI_VISION_MODEL=mimo-v2.5` (test vision thật OK).

## Blockers
- Không.

## Next (khi anh muốn)
- Không còn blocker — refactor 4 đợt hoàn tất + verified production (gồm admin login GitHub OAuth OK).
- Theo dõi model vision `mimo-v2.5` (qwen có thể sống lại — cân nhắc đổi lại).
- Backlog cũ: shop_policies cho AI, nhập giá thật, GA4 measurement ID (B1-B3 post-Release B).

## Kỹ thuật lưu ý
- Model vision hiện tại `mimo-v2.5` (qwen3.7-plus/3.8-max đều 503 từ provider 16-08) — nếu qwen sống lại có thể cân nhắc đổi lại.
- `AI_ENABLED` kill switch giờ áp cho CẢ ai-chat lẫn vision-intake (tắt toàn bộ AI khi cần).
- Admin allowlist giờ ở `lib/admin.ts` (client) + `admin_uids` bảng (DB RLS) — thêm admin phải sửa CẢ 2 chỗ + Supabase Auth user.
- Server local 3000 chạy next-server — khi build phải unset env ô nhiễm.
