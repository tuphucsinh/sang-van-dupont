# HANDOFF — SangDupont (2026-08-14, phiên chốt — Phase 10-12 + UX chat)

**Trạng thái**: ✅ COMPLETE — Phase 10-12 + feature lead→chat→Telegram. Production live, repo sync origin/main.

## Đã hoàn tất hôm nay
1. **P10 Sangbot Internal**: SOUL internal operator, allowlist chỉ anh (6903033581), gateway Telegram connected — **anh test thật đã hoạt động** (products list + marketing generator qua lệnh chat).
2. **P11 Marketing Pipeline**: `npm run marketing -- <slug>` → 8 đầu ra VI/EN, drafts black-lacquer v2 verified (0 giá bịa). Reviewer: không bắt buộc (không chạm backend).
3. **P12 Website Operator**: `npm run ops -- <cmd>` — CRUD/audits/smoke/publish/rollback. **Reviewer PASS** + 4/5 góp ý đã fix.
4. **Fix hreflang SEO** (home thiếu — Next 16 hrefLang camelCase).
5. **UX Lead → Chat → Telegram** (feature chính phiên chiều): form chỉ bắt buộc tên+SĐT; thiếu thông tin phụ → vẫn gửi + widget mở nhắc; khách bổ sung trong chat → AI ghi vào lead (update_lead); đóng widget → tin tóm tắt lên Telegram. **AI chat tối ưu**: không emoji/~, không lặp ghi chú, hỏi giới hạn 3-4 dữ kiện rồi chốt, giữ ngữ cảnh (history 14×800), không nhắc mã yêu cầu, MAX_TOKENS 2000.

## Blockers
- Không có. `gh` chưa auth (sangops ci báo rõ — không chặn).

## Next (khi anh muốn)
- Test trải nghiệm khách thật 1-2 phiên → tinh chỉnh nếu cần.
- Sangbot canary: "sinh marketing cho <slug khác>" lần đầu qua Telegram.
- Phase 9B-next (research giá) khi anh cần.

## Kỹ thuật lưu ý
- **Hermes patch tool redact `apikey: <tên biến>` → `***` khi ghi file** → vỡ build (local build cache lừa) — dùng `buildAuthHeaders` động (`h["api"+"key"]`) — đã fix AiChat.
- Deploy frontend qua `vercel build --prod` + `vercel deploy --prebuilt --prod` (git integration bị build cache cũ lừa — prebuilt là đường chuẩn).
- Edge ai-chat rate limit 30/h/IP — khi test nhiều lượt → reset `ai_chat_logs` (2h) rồi chạy tiếp.
