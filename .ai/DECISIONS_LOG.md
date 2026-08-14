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

## 2026-08-14 — Reviewer SW-P2-MIGRATIONS-01: PASS + 3 góp ý ghi nhận

| # | Góp ý | Xử lý |
|---|---|---|
| R1 | An toàn admin phụ thuộc "tắt signup" bằng UI — nếu bật lại, mọi authenticated thành admin | Ghi nhận → Phase 4 Admin sẽ cân nhắc claim/role chuyên biệt cho write (vd `is_admin` claim) |
| R2 | site_settings public read toàn bộ — đừng đưa giá trị vận hành/secret vào bảng | Ghi nhận → rule: bảng này chỉ chứa content công khai; secret ở Edge Functions env |
| R3 | case_studies chưa seed; nhãn `storage_bucket` lệch mermaid (cosmetic) | Ghi nhận → seed case_studies khi Phase 3 cần; nhãn không phải lỗi |

## 2026-08-14 — Phase 3 chốt: SSG catalog + ảnh hiện có

| # | Quyết định | Lý do |
|---|---|---|
| D14 | **Catalog = static generation tại build** (SSG, `generateStaticParams` + fetch build-time); không ISR (static export không hỗ trợ); publish → rebuild/redeploy | Catalog nhỏ, thay đổi hiếm; SEO + tốc độ tối ưu; đúng static-first đã duyệt (file 1 §4.2). Khi publish dày → tự động rebuild (Phase 7) hoặc chuyển 1 phần client-fetch (schema không đổi) |
| D15 | **Ảnh catalog hiện có serve static từ `public/assets/img/`** (URL tương đối trong `product_media.url`); KHÔNG upload Storage ở Phase 3 | Ảnh nhỏ ít, serve tĩnh nhanh nhất, không thêm dependency; chuyển Storage sau này chỉ đổi giá trị URL trong DB — code không đổi |
| D16 | Product detail: URL riêng `/vi/products/[slug]` + `/en/products/[slug]` (2 route wrap chung component, lang prop); trang chủ giữ root (chưa refactor [lang] toàn site) | Đáp ứng SEO VI/EN cho detail mà không refactor lớn; canonical + hreflang hoàn thiện ở Phase 6 |
| D17 | Dùng tên sản phẩm THẬT từ landing (I18N dict p1–p9) làm catalog seed (thay `[SEED]`), price NULL = "Liên hệ" (file 1: "giá hoặc Liên hệ") | Anh chốt ảnh hiện có + tên thật; không bịa giá khi chưa có giá thật |

## 2026-08-14 — Phase 4 chốt: admin login GitHub OAuth + allowlist

| # | Quyết định | Lý do |
|---|---|---|
| D18 | **Admin login = GitHub OAuth** (Supabase Auth provider) + **allowlist email** (chỉ `tvccbod@gmail.com` — email GitHub của anh) trong RLS | Anh login quen, 2FA GitHub sẵn; mọi authenticated khác chỉ đọc public (R1 reviewer xử lý — không ai khác write được kể cả khi authorize OAuth) |
| D19 | Admin CRUD **client-side** (supabase-js + user session → PostgREST qua RLS) — static export KHÔNG có server actions/route handlers | `output:'export'` giới hạn; RLS là lớp enforce thật (không chỉ UI guard) |
| D20 | Route admin: `/admin` (login) + `/admin/products` (CRUD) + `/admin/leads` (xem lead); client guard + RLS enforce | Tách rõ login vs CRUD vs lead; Phase 4 gồm luôn xem lead (anh chốt) |

## 2026-08-14 — Reviewer SW-P4-ADMIN-01: PASS + 4 góp ý

| # | Góp ý | Xử lý |
|---|---|---|
| R4-1 | Sanitize storage path (slug thô có thể chứa ký tự lạ) | ✅ Fix: slugify() + ext lọc a-z0-9 |
| R4-2 | Upload chỉ check size, không check MIME | ✅ Fix: `file.type.startsWith('image/')` |
| R4-3 | Xóa product → file bucket orphan | ✅ Fix: storage.remove trước delete |
| R4-4 | ADMIN_EMAIL lặp 3 nơi; ARCHITECT §4 ghi "signed URL qua Edge Function" nhưng thực tế createSignedUrl client-side | Ghi nhận: RLS là nguồn sự thật duy nhất (an toàn vì is_admin chặn); cập nhật ARCHITECT §4 khi Phase 7 (signed URL client-side OK vì RLS) |
