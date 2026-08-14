# HANDOFF — SangDupont (2026-08-14, phiên khép)

**Trạng thái**: ✅ COMPLETE — Release A (Gate 10/10) + Release B (Gate 4/4) + Phase 9A/9B (Vision/Admin draft/Recommend) + vô số fix UX/i18n/mobile. Repo sync GitHub `main`.

**Chạy được**: `sangdupont.vercel.app` — catalog 8 SP VI/EN + admin (GitHub OAuth tvccbod / email aivntps) + lead→Telegram (text+ảnh+AI sơ bộ) + AI chat widget (deepseek-v4-flash, i18n VI/EN) + vision (qwen3.7-plus) + Recommend + backup cron CN.

**Còn mở (không chặn)**: B1 shop_policies (để sau) · B2 giá thật (anh nhập /admin) · B3 GA4 ID (chờ anh) · Research 9B-next (khi anh muốn).

**Ops**: Publish = /admin → rebuild deploy. Kill AI = `supabase secrets set AI_ENABLED=false`. Backup CN 08:00 tự động. Keepalive T7/CN đa-project.

**Bài học phiên** → skill `static-website-supabase` (9 pitfalls phổ quát + workflow 7 bước).

**Next**: chờ anh — GA4 ID / giá thật / policies / Research.
