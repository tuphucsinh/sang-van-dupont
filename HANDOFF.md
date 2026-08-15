# HANDOFF — SangDupont (2026-08-15, phiên chốt — UI + chat AI tối ưu)

**Trạng thái**: ✅ COMPLETE — UI homepage + chat widget AI nâng cấp. Production live, repo sync origin/main.

## Đã hoàn tất hôm nay
1. **UI homepage**: Collection card đồng đều aspect 3/2 (bỏ tall, ảnh tự crop cover); Hero bỏ nút GỌI NGAY; CTA "CHAT TƯ VẤN" dưới Collection + "CHAT BẢO DƯỠNG" dưới Dịch vụ (mở widget kèm lời chào riêng — event `sang-chat-prompt`); Contact bỏ nút Chat tư vấn (còn GỌI NGAY/ZALO/MESSENGER/TIKTOK).
2. **Chat widget — model gpt-5.6-luna (opencode-go)**: đổi từ deepseek-v4-flash; fix 2 bug (max_tokens → max_completion_tokens; finish_reason null khi tool_calls); prompt 2 bậc ngoài phạm vi (lần 1 dẫn dắt khéo, lần 2+ từ chối); cấm emoji/~ nhấn mạnh; xin tên+SĐT khéo léo khi kết thúc; **link sản phẩm nhúng [Tên](url)** — widget render `<a>` vàng (không url trần).
3. **Vercel ops**: env NEXT_PUBLIC_* đổi Sensitive → Non-sensitive (fix `vercel pull` trả `[SENSITIVE]` làm build fail); deploy prebuilt chuẩn; patch skill `vercel-deploy-workflow` (pitfall mới).

## Blockers
- Không có.

## Next (khi anh muốn)
- Test trải nghiệm khách thật 1-2 phiên (2 nút CTA + chat bảo dưỡng) → tinh chỉnh nếu cần.
- Sangbot canary qua Telegram nếu cần.

## Kỹ thuật lưu ý
- Model gpt-5.6-luna qua opencode-go: `finish_reason` null kèm `tool_calls` — code đã check `tool_calls?.length` trực tiếp; tham số completion theo model (`gpt-5.6*` → `max_completion_tokens`).
- Edge function ai-chat: env qua Supabase secrets (AI_MODEL/AI_BASE_URL/AI_API_KEY) — KHÔNG hard-code model.
- Backtick trong SYSTEM_PROMPT (template literal) → vỡ bundle — cấm dùng.
