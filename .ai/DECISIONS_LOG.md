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

## 2026-08-14 — Chốt host: Vercel tạm thời, TENTEN hoãn

| # | Quyết định | Lý do |
|---|---|---|
| D21 | **Host tạm thời = Vercel** (`sangdupont.vercel.app`) — KHÔNG deploy TENTEN trong Release A. TENTEN dời lại: chỉ khi (a) cần domain Việt Nam / giảm chi phí / Vercel Free hết hạn, hoặc (b) anh yêu cầu → làm sub-phase "migrate TENTEN" riêng | Anh chỉnh kế hoạch 2026-08-14: Vercel đang chạy ổn + free, không cần thêm bước deploy ngay; Phase 7 giờ = Release A Gate + deploy Vercel ổn định + rollback |

| D22 | **Tách Phase 9 thành 9A + 9B** (Sequential Thinking 2026-08-14): 9A = Ops hoàn thiện (shop_policies, /admin/stats, GA4, nhập giá) — KHÔNG gated, ROI ngay; 9B = Full AI (Vision/Admin draft/Research/Recommendation) — GATED chờ 2-4 tuần usage thật + GA4 | Tránh backlog chết chờ; nguyên tắc MVP-first + ROI của anh |
| D23 | **i18n URL-based** (`/vi/` `/en/` + root redirect) — CẤM JS state/localStorage cho đổi ngôn ngữ (lệch form/widget); mọi link nội bộ theo lang | Fix cuối phiên tốn ~2h vì dùng state — bài học nhập skill |
| D24 | **Đóng phiên 14-08**: rút skill tổng quát `static-website-supabase` (9 pitfalls phổ quát) — chi tiết dự án giữ `.ai/`, kiến thức tái dùng vào skill | Sequential Thinking + PDCA rà toàn bộ phiên |
| D25 | **Skill `premium-website-design`**: nguyên tắc design premium (màu/typography/không gian/wow-detail) + AI features theo bậc ROI (chat → vision → draft → recommend → research) + guard AI | Anh yêu cầu tổng hợp sau đóng phiên — dùng cho mọi project website sau |

## 2026-08-14 — Backlog post-Release B

| # | Việc | Trạng thái |
|---|---|---|
| B1 | Bảng `shop_policies` + tool `get_policies` — để AI trả lời chính sách (COD/đổi trả/giao hàng) chính xác, anh tự sửa qua SQL editor không cần redeploy | Để sau (anh chốt 14-08) — hiện AI chỉ "dẫn chủ shop 0905 076 886" |
| B2 | Nhập giá thật qua `/admin/products` (price, price_unit) — AI tự trả lời giá ngay (tool đã trả price, không cần redeploy) | Chờ anh quyết giá từng mẫu |
| B3 | GA4 Measurement ID → set env Vercel + rebuild | Chờ anh tạo property |
| B4 | Backup cron định kỳ — **✅ DONE 2026-08-14**: gộp vào cron CN 08:00 (`supabase_keepalive_backup.py` = ping + backup sangwebsite giữ 7 bản); T7 21:00 giữ ping thuần. Ghi chú: KURABE backup TẮT (CLI fail IPv6 — cần `supabase link` + DB password khi cần) |
| B5 | Giám sát AI usage (ai_chat_logs) — cost cap 100/ngày | Tự động, Mika báo khi gần ngưỡng |

## 2026-08-14 — Reviewer SW-P4-ADMIN-01: PASS + 4 góp ý

| # | Góp ý | Xử lý |
|---|---|---|
| R4-1 | Sanitize storage path (slug thô có thể chứa ký tự lạ) | ✅ Fix: slugify() + ext lọc a-z0-9 |
| R4-2 | Upload chỉ check size, không check MIME | ✅ Fix: `file.type.startsWith('image/')` |
| R4-3 | Xóa product → file bucket orphan | ✅ Fix: storage.remove trước delete |
| R4-4 | ADMIN_EMAIL lặp 3 nơi; ARCHITECT §4 ghi "signed URL qua Edge Function" nhưng thực tế createSignedUrl client-side | Ghi nhận: RLS là nguồn sự thật duy nhất (an toàn vì is_admin chặn); cập nhật ARCHITECT §4 khi Phase 7 (signed URL client-side OK vì RLS) |

## 2026-08-14 — Reviewer SW-P5-LEADPIPE-01: PASS + 4 góp ý

| # | Góp ý | Xử lý |
|---|---|---|
| R5-1 | clientIp tin entry đầu x-forwarded-for — client spoof IP qua rate limit | Ghi nhận: rủi ro chấp nhận (D13 dời Turnstile; giai đoạn thử nghiệm) — bổ sung Turnstile + IP platform khi public rộng |
| R5-2 | Client 2MB vs server 1.5MB lệch — ảnh 1.5-2MB bị bỏ âm thầm | ✅ Fix: đồng bộ client 1.5MB |
| R5-3 | storage.sql policy authenticated cho lead-attachments phụ thuộc thứ tự migration | ✅ Fix: bỏ policy khỏi storage.sql, chỉ tạo bucket; policy is_admin duy nhất ở admin_rls.sql; verify remote chỉ còn 3 policy đúng |
| R5-4 | Không log Telegram response | ✅ Fix: log tgRes.status + body khi !ok |

## 2026-08-14 — Verify login thật production + bài học disable_signup

**Kết quả verify end-to-end (production)**: GitHub OAuth login ✅ (user `tvccbod@gmail.com` provider github), CRUD create ✅ (product test), delete ✅ (DB sạch 9 products), RLS is_admin ✅. **Phase 4 hoàn tất 100%**.

| # | Bài học | Chi tiết |
|---|---|---|
| L1 | **`disable_signup: true` chặn CẢ GitHub OAuth tạo user mới** (lỗi `signup_disabled` khi login lần đầu) | Fix đúng: `disable_signup: false` + `external_email_enabled: false` (tắt hẳn email provider) + `external_github_enabled: true` → chỉ GitHub là đường vào, email không login được. An toàn vì RLS is_admin() chặn write cho mọi người khác |
| L2 | GitHub OAuth redirect_uri phải khớp CHÍNH XÁC `https://<ref>.supabase.co/auth/v1/callback` — dán nhầm URL lỗi (`localhost:3000/?error=...`) → GitHub báo "redirect_uri is not associated" | Khi gặp lỗi này: kiểm tra Redirect URIs trong GitHub settings app, xóa URL lạ, dán đúng callback, bấm Update application |
