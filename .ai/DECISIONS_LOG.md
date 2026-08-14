# DECISIONS LOG — SangDupont

> Status: **MASTERPLAN APPROVED 2026-08-14 (anh duyệt)** — Phase 1 băm task xong, sẵn sàng `/do`
> Format: mỗi entry = ngày, quyết định, lý do, nguồn. Append-only.

## 2026-08-14 — Chuẩn hóa project + masterplan từ 2 file kế hoạch

| # | Quyết định | Lý do | Nguồn |
|---|---|---|---|
| D1 | **Static-first**: Next.js + TS `output: 'export'`, không Node thường trực ở Release A | Catalog nhỏ, ít trang, RAM/CPU TENTEN tối thiểu; phần động offload Supabase | file 1 §15 (phán quyết, High) |
| D2 | **Build off-host**: GitHub Actions/PC → `out/` → TENTEN; không build trên hosting | next build tốn RAM/CPU; disk production sạch | file 1 §3.3 |
| D3 | **Supabase Free** cho DB/Auth/Storage/Edge Functions; nâng Pro khi uptime/backup thành yêu cầu kinh doanh | Website nhỏ, Free đủ; không nâng vì "production" | file 1 §8 |
| D4 | **No ISR**: static generation tại build cho catalog; rebuild/deploy sau publish | Cache ISR ghi disk trên self-host; tần suất đổi thấp | file 1 §4.2 |
| D5 | **Mọi secret server-side** qua Edge Functions (Telegram/service-role/AI key); không bao giờ ở client | An toàn; file 1 §4.5 + capabilities | file 1 §3.1 |
| D6 | **Lead attachments private** (bucket private + RLS); product media public (WebP/AVIF tối ưu) | Quyền riêng tư khách; ảnh product là public content | file 1 §4.5, §8 |
| D7 | **3 nguồn sự thật tách rõ**: Git (content) / Supabase (operational) / Research DB (market) — KHÔNG dùng Hermes MEMORY cho giá/tồn kho/lead/research | Ngăn AI bịa data; canonical duy nhất | capabilities §Nguồn dữ liệu |
| D8 | **Release A không AI public**; Release B chỉ khi catalog + lead chuẩn; Full AI chỉ khi Release B có sử dụng thật | MVP-first; AI sau nền tảng vững | file 1 mục tiêu #6, §5, §6 |
| D9 | **Hermes internal vs public tách quyền**: internal có code/git; public concierge profile riêng tối thiểu quyền (không shell/fs/git/subagent) | Giới hạn bề mặt tấn công public | capabilities §Kiến trúc vai trò + §Giới hạn bắt buộc |
| D10 | **AI tool calling chỉ 3 tools validated**: search products, get product state, create lead/handoff | Catalog nhỏ → SQL/filter đủ; không RAG/vector ở Release B | file 1 §5.2 |
| D11 | **AI chỉ tạo draft; human duyệt trước publish**; vision không chốt thật/giả, không định giá | Nguyên tắc authenticity — claim quan trọng không AI tự suy đoán | capabilities §1 + §2 |
| D12 | **Host**: giữ Vercel live làm bridge, TENTEN là target — chuyển khi TENTEN sẵn sàng (OPEN — hỏi anh Phase 7) | Không phụ thuộc Vercel-specific services; static = host-agnostic | file 1 §1.3, OPEN DECISIONS |
| D13 | **Turnstile** chống spam form public (đề xuất — chờ anh xác nhận Phase 5) | Anti-abuse chi phí thấp | file 1 §3.1 |

**Mâu thuẫn 2 file đã giải quyết**: capabilities đề xuất bắt đầu bằng AI Content/CMS + image intake; file 1 §mục tiêu #6 nói "không đưa AI trước khi catalog + lead đủ chuẩn" → **file 1 (kế hoạch tinh gọn) là xương sống**: website Release A trước (P1–P7), AI nội bộ (content/operator) chỉ chạy khi có nền tảng + nhu cầu thật (P9); research (giá trị cao nhất theo capabilities) xếp Full AI giai đoạn cuối theo ROI.
