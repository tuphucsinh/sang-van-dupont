# KẾ HOẠCH NÂNG CẤP WEBSITE SANGDUPONT — TINH GỌN / TỐI ƯU TENTEN

**Website hiện tại:** `sangdupont.vercel.app`  
**Nguồn đánh giá:** `Sangwebsite.zip`  
**Production target:** TENTEN Vibe Code Hosting  
**Backend/data target:** Supabase Free trước, chỉ nâng Pro khi có nhu cầu thật  
**Trạng thái:** Kế hoạch mục tiêu — chưa triển khai  

**Nguyên tắc tối ưu:** website nhỏ, ít sản phẩm, tài nguyên hosting không dư dả → **static-first, compute offload, build off-host, không chạy Node thường trực nếu chưa cần**.

---

## 1. Mục tiêu

Nâng landing page hiện tại thành website công ty/bán hàng nhỏ có catalog, quản trị sản phẩm, lead pipeline, SEO và AI mở rộng được nhưng vẫn:

1. Giữ giao diện luxury đen–vàng hiện tại.
2. Chạy nhẹ trên TENTEN, ưu tiên RAM/CPU/disk thấp.
3. Không phụ thuộc Vercel-specific services.
4. Dùng Supabase Free cho database/auth/storage/backend nhẹ.
5. Không để API key/secret trong trình duyệt.
6. Không đưa AI vào trước khi catalog và lead pipeline đủ chuẩn.
7. Có thể chuyển host sau này mà không viết lại hệ thống.

---

## 2. Hiện trạng

### Giữ

- Hero, typography, màu sắc và cảm giác premium.
- Gallery, animation vừa phải, CTA đa kênh.
- Responsive mobile hiện có.
- Nội dung ngắn, trực quan.

### Cần nâng cấp

- HTML/CSS/JS tĩnh → cấu trúc Next.js + TypeScript dễ bảo trì.
- Gallery → catalog sản phẩm có dữ liệu thật.
- Thêm trang chi tiết sản phẩm.
- Thêm admin/CMS tối giản.
- Thêm form lead và upload ảnh.
- Thêm database, auth, private storage.
- Chuẩn hóa SEO song ngữ, tracking và metadata.
- Thêm lớp backend an toàn cho Telegram/AI.
- Dọn repo production khỏi preview, dữ liệu crawl, file tạm và asset thừa.

---

# 3. KIẾN TRÚC CHỐT — STATIC-FIRST

## 3.1. Stack

### TENTEN

- **Next.js App Router + TypeScript**.
- Release A ưu tiên **static export** (`output: 'export'`).
- TENTEN chủ yếu phục vụ HTML/CSS/JS đã build sẵn.
- Không dùng TENTEN làm database hoặc nơi lưu media lớn.
- Không chạy image optimizer động trên hosting.
- Không build production trên hosting nếu có thể tránh.

### Supabase Free

- PostgreSQL: products, leads, content metadata.
- Auth: một/few admin account; tắt public signup.
- Storage: ảnh sản phẩm và ảnh khách upload.
- RLS: bắt buộc cho bảng exposed.
- Edge Functions: các tác vụ cần secret/server-side như Telegram, anti-abuse, AI proxy.

### Khác

- GA4 + Search Console cho analytics/SEO.
- Telegram Bot API cho lead notification.
- Turnstile hoặc tương đương cho form/AI public nếu cần.
- AI provider gọi qua server/Edge Function; không gọi bằng secret từ browser.

---

## 3.2. Vì sao chọn static-first

Với vài trang và ít sản phẩm, Node server chạy 24/7 đem lại ít lợi ích nhưng tốn RAM/CPU và tăng bề mặt lỗi.

Mục tiêu Release A:

```text
Browser
   │
   ├── HTML/CSS/JS static ─────────────── TENTEN
   │
   ├── product/content data ───────────── Supabase
   │
   ├── admin auth / CRUD ──────────────── Supabase
   │
   ├── product/customer media ─────────── Supabase Storage/CDN
   │
   └── sensitive actions / AI ─────────── Supabase Edge Functions / AI API
```

Kết quả mong muốn:

- RAM TENTEN khi phục vụ web: rất thấp.
- CPU TENTEN: chủ yếu serve static files.
- Disk TENTEN: chỉ source/build output nhỏ.
- Database/media/AI không ăn tài nguyên hosting.

---

## 3.3. Build và deploy

**Không lấy TENTEN làm máy build chính.**

Luồng ưu tiên:

```text
GitHub
  ↓
GitHub Actions hoặc PC build
  ↓
next build
  ↓
out/ production artifact
  ↓
TENTEN
  ↓
smoke test
```

Lý do:

- `next build` có thể dùng RAM/CPU cao hơn nhiều so với lúc serve.
- Không để `.next/cache`, `node_modules`, source test và artifact dev chiếm disk production.
- Deployment chỉ mang file cần để chạy.

Nếu sau này TENTEN cung cấp pipeline build đủ ổn định/tài nguyên rõ ràng, có thể dùng Git integration nhưng vẫn giữ khả năng build ngoài host.

---

## 3.4. Quy tắc tài nguyên

### RAM/CPU

- Không Node process thường trực ở Release A nếu static export đáp ứng đủ.
- Không runtime image optimization trên TENTEN.
- Không cron/worker/background job trên hosting.
- Không realtime websocket nếu chưa có use case.
- Không SSR cho nội dung có thể static/client-fetch.
- Không vector DB/RAG ở giai đoạn đầu.

### Disk

Không deploy:

- `.git`
- `node_modules`
- `.next/cache`
- preview screenshots
- crawl/raw data
- source image gốc không cần production
- backup lớn
- log dài hạn

Ưu tiên:

- ảnh tối ưu WebP/AVIF.
- media sản phẩm → Supabase Storage.
- logo/icon nhỏ có thể giữ trong static assets.
- retention rõ cho ảnh lead cũ.

---

# 4. RELEASE A — WEBSITE HOÀN CHỈNH, KHÔNG AI PUBLIC

**Mục tiêu:** tạo phần lớn giá trị kinh doanh nhưng vẫn gần như static ở TENTEN.

## 4.1. Foundation + migration

- Chuyển UI hiện tại sang Next.js + TypeScript.
- Giữ visual parity desktop/mobile.
- Component hóa nhưng không over-engineer.
- Chỉ dùng Client Component khi cần tương tác.
- Hạn chế dependency; không thêm UI framework nặng nếu CSS hiện tại đủ dùng.
- Bật strict TypeScript, lint/typecheck/build.
- Dọn asset/repo.

**Gate:** build sạch, không lỗi console nghiêm trọng, giao diện không regression đáng kể.

---

## 4.2. Catalog nhỏ

Mỗi sản phẩm có:

- id / slug
- tên/mã
- dòng sản phẩm
- chất liệu
- năm/thời kỳ nếu biết
- tình trạng
- mô tả VI/EN
- giá hoặc “Liên hệ”
- trạng thái `draft / available / reserved / sold / archived`
- cover + gallery

Catalog có:

- lọc cơ bản
- tìm kiếm nhẹ phía client
- badge trạng thái
- CTA hỏi đúng sản phẩm

### Chiến lược render

Vì số sản phẩm ít:

- ưu tiên static generation tại build.
- dữ liệu thay đổi ít → rebuild/redeploy sau publish là chấp nhận được.
- không dùng ISR nếu không cần vì cache ISR ghi disk trên self-host.

Nếu sau này sản phẩm cập nhật thường xuyên hơn, chuyển catalog sang client fetch hoặc Node runtime có kiểm soát mà không đổi schema.

---

## 4.3. Trang chi tiết sản phẩm

- URL riêng VI/EN.
- Gallery ảnh.
- Video/link video nếu có.
- Metadata/Open Graph riêng.
- Product structured data ở mức phù hợp.
- CTA Zalo/Telegram/call.
- Similar products bằng filter đơn giản, không cần recommendation engine.

**Gate:** 100% sản phẩm published có slug, cover, trạng thái và metadata hợp lệ.

---

## 4.4. Admin/CMS tối giản

Admin dùng Supabase Auth + RLS.

Chức năng:

- đăng nhập admin
- thêm/sửa/ẩn sản phẩm
- đổi trạng thái hàng
- upload/sắp xếp ảnh
- nội dung VI/EN
- FAQ/testimonial/case study cơ bản
- xem lead

Không làm:

- multi-role phức tạp
- workflow duyệt nhiều cấp
- audit log lớn
- realtime dashboard

### Publishing

Vì public site ưu tiên static:

1. admin lưu dữ liệu Supabase;
2. publish sản phẩm;
3. trigger rebuild/deploy hoặc thao tác deploy đơn giản;
4. public site nhận dữ liệu mới.

Nếu việc publish diễn ra thường xuyên, tự động hóa rebuild ở phase sau.

---

## 4.5. Lead pipeline

### Tư vấn mua

- ngân sách
- nhu cầu
- phong cách/dòng quan tâm
- tên
- điện thoại/Zalo
- kênh liên hệ

### Bảo dưỡng/kiểm tra

- mô tả vấn đề
- ảnh
- thông tin liên hệ
- consent xử lý dữ liệu

### Luồng

```text
Browser
  ↓
Turnstile/validation
  ↓
Supabase Edge Function
  ├── lưu lead
  ├── tạo mã yêu cầu
  ├── tạo/kiểm soát upload
  └── gửi Telegram
```

Không để Telegram bot token hoặc service-role key ở client.

**Gate:** lead hợp lệ được lưu + notification hoạt động; ảnh khách private.

---

## 4.6. SEO + tracking + performance

### SEO

- `/vi/...` và `/en/...`
- canonical
- `hreflang`
- sitemap
- robots
- Open Graph
- structured data
- semantic HTML

### Tracking

GA4 events tối thiểu:

- `view_product`
- `click_zalo`
- `click_telegram`
- `click_call`
- `start_form`
- `submit_form`
- `qualified_lead`

### Performance

- pre-optimize ảnh thành WebP/AVIF.
- `srcset/sizes` hoặc generated variants khi phù hợp.
- lazy-load ảnh dưới fold.
- không dùng runtime `next/image` optimization trên TENTEN.
- hạn chế animation trên mobile và hỗ trợ `prefers-reduced-motion`.
- giảm JS client bundle.

**Mục tiêu:** Lighthouse mobile Performance ≥ 85; desktop ≥ 90; Accessibility/SEO/Best Practices ≥ 90 khi điều kiện test cho phép.

---

## RELEASE A GATE

Chỉ production khi:

- static build/deploy TENTEN PASS.
- catalog + product detail PASS.
- admin Supabase PASS.
- form/upload/Telegram PASS.
- RLS/private storage PASS.
- VI/EN + SEO PASS.
- analytics events PASS.
- desktop/mobile PASS.
- production artifact gọn, không chứa file dev/raw/backup không cần thiết.
- có rollback deployment và backup DB thủ công tối thiểu.

---

# 5. RELEASE B — AI CONCIERGE

**Không chuyển toàn website sang SSR chỉ để thêm AI.**

Website public vẫn static-first; AI chạy ngoài TENTEN hoặc qua endpoint server rất nhẹ.

## 5.1. Kiến trúc AI ưu tiên

```text
Static website on TENTEN
        ↓
AI chat UI
        ↓
Supabase Edge Function / lightweight API
        ↓
AI provider
        ↓
Validated tools
        ├── search products
        ├── get product state
        └── create lead / handoff
```

### Ưu điểm

- AI không ăn RAM/CPU của hosting.
- secret nằm server-side.
- dễ giới hạn quota và tắt riêng AI.
- website vẫn chạy nếu AI lỗi.

---

## 5.2. AI concierge

AI được phép:

- hỏi nhu cầu/ngân sách/mục đích mua
- giải thích sản phẩm/dịch vụ từ dữ liệu đã duyệt
- tìm sản phẩm thật trong DB
- chỉ đề xuất trạng thái được phép bán
- so sánh 2–3 lựa chọn
- thu lead
- gửi handoff cho Sang

AI không được:

- bịa sản phẩm/giá/tồn kho
- khẳng định thật/giả
- tự chốt giá
- tự cam kết bảo hành/thời gian sửa
- tự sửa production data

### Không dùng ở Release B

- vector DB lớn
- RAG nhiều tầng
- agent đa bước phức tạp
- browser automation
- tool có quyền rộng

Catalog nhỏ → SQL/filter/tool calling đủ.

---

## 5.3. AI guard

- rate limit
- quota/session
- token cap
- bot protection
- timeout
- log lỗi/usage tối thiểu
- cost cap
- kill switch
- eval cố định

**Gate:** không giới thiệu sản phẩm không tồn tại/không bán; policy thật/giả/giá hoạt động; handoff end-to-end PASS.

---

# 6. FULL AI — AI NỘI BỘ + VISION

Chỉ triển khai khi Release B có sử dụng thật.

## 6.1. AI nội bộ

Trong admin:

- draft mô tả VI/EN
- caption
- alt text
- tóm tắt tình trạng
- draft case study

**AI chỉ tạo draft; admin duyệt trước publish.**

---

## 6.2. AI vision

Tên: **Trợ lý tiếp nhận và đánh giá hình ảnh sơ bộ**.

Có thể:

- kiểm tra thiếu góc ảnh
- mô tả đặc điểm thấy được
- nhận xét xước/móp/oxy hóa ở mức quan sát
- yêu cầu ảnh bổ sung
- tạo phiếu tóm tắt

Không được:

- xác nhận thật/giả
- định giá cuối cùng
- thay chuyên gia kiểm tra trực tiếp

Ảnh được upload thẳng Supabase Storage; TENTEN không lưu bản gốc.

---

## 6.3. Gợi ý sản phẩm

- filter deterministic chọn candidate
- AI chỉ giải thích recommendation
- không cho model tự chọn sản phẩm ngoài dữ liệu thật

**Full AI gate:** upload/private storage PASS; disclaimer rõ; human review với kết luận quan trọng; usage/cost/kill switch PASS.

---

# 7. DỮ LIỆU CỐT LÕI

Tối thiểu:

- `products`
- `product_media`
- `services`
- `testimonials`
- `case_studies`
- `faq`
- `leads`
- `lead_attachments`
- `site_settings`
- `ai_conversations` hoặc `ai_summaries` khi Release B

Không mở rộng schema nếu chưa có use case thật.

---

# 8. SUPABASE FREE — CÁCH DÙNG TỐI ƯU

Với website nhỏ, ưu tiên Free trước.

## Database

- chỉ lưu metadata/text/lead.
- không nhét binary/media vào DB.
- index đúng các trường `slug`, `status`, `created_at` cần query.
- tránh realtime nếu không cần.

## Storage

- product images tối ưu trước upload.
- giới hạn kích thước ảnh.
- thumbnail/medium/full nếu thực sự cần.
- ảnh khách private.
- retention/xóa ảnh lead cũ theo policy.

## Edge Functions

Chỉ dùng cho:

- Telegram notification
- signed/private workflow
- anti-abuse validation
- AI proxy/tool calling

Không dùng Edge Function cho những việc browser + RLS làm an toàn được.

## Free-plan limitation cần chấp nhận

- project có thể pause sau thời gian không hoạt động.
- không có automatic DB backup như Pro.

Khi website trở thành kênh kinh doanh quan trọng hoặc uptime/backup bắt buộc, nâng Supabase Pro; không nâng chỉ vì “production”.

---

# 9. TESTING VÀ VẬN HÀNH

Trước release:

- typecheck
- lint
- build
- bundle/dependency review
- route/404/VI-EN test
- admin CRUD test
- RLS test
- private storage test
- lead/Telegram test
- analytics test
- mobile/desktop test
- restore/rollback test

Production workflow:

```text
branch
  ↓
CI build
  ↓
preview/test
  ↓
production artifact
  ↓
TENTEN deploy
  ↓
smoke test
```

### Rollback

- giữ artifact production trước đó.
- lỗi frontend → redeploy artifact cũ.
- migration DB phải backward-compatible khi có thể.
- trước migration quan trọng → export/backup DB.

---

# 10. KHI NÀO MỚI CHUYỂN SANG NODE SERVER TRÊN TENTEN

Chỉ bật Next.js Node runtime/`output: 'standalone'` nếu static-first bắt đầu gây bất tiện rõ ràng, ví dụ:

- sản phẩm thay đổi liên tục và cần publish tức thời.
- cần SSR theo request.
- cần server-side route đặc thù không phù hợp Edge Function.
- cần streaming trực tiếp qua host và đã xác minh proxy hỗ trợ tốt.

Nếu chuyển:

- dùng `output: 'standalone'`.
- build ngoài host.
- deploy `.next/standalone` + `.next/static` + `public` cần thiết.
- chỉ 1 Node process nếu traffic thấp.
- tránh ISR/cache disk không kiểm soát.
- giữ image/media ngoài host.
- không custom server nếu không bắt buộc.

**Mặc định hiện tại: chưa cần chuyển.**

---

# 11. NHỮNG VIỆC CHƯA NÊN LÀM

- checkout online nếu vẫn chốt giao dịch thủ công.
- marketplace.
- app mobile riêng.
- realtime dashboard.
- Redis nếu chưa có vấn đề cần Redis.
- vector DB/RAG lớn.
- voice/avatar AI.
- AI tự đăng bài.
- AI tự định giá/xác thực thật giả.
- nhiều tầng admin role.
- SSR toàn site chỉ vì “Next.js hỗ trợ”.
- chạy image transform động trên shared hosting.

---

# 12. NGÂN SÁCH CHỐT

| Mốc | Phạm vi | Tổng giá trị |
|---|---|---:|
| **Hiện tại** | Landing page static hiện có | **8,5 triệu đồng** |
| **Release A** | Catalog + product detail + CMS + lead pipeline + SEO/performance/tracking | **27–29 triệu đồng** |
| **Release B có AI concierge** | Release A + AI concierge + tool calling + handoff + production guard | **34–36 triệu đồng** |
| **Full AI** | Release B + AI nội bộ + AI vision + recommendation + hardening | **43–44 triệu đồng** |

### Chi phí nâng cấp tương ứng

- Hiện tại → **Release A:** thêm khoảng **18,5–20,5 triệu đồng**.
- Release A → **Release B:** thêm khoảng **7 triệu đồng**.
- Release B → **Full AI:** thêm khoảng **7–10 triệu đồng** tùy độ sâu vision/automation.

Giá trị trên chưa gồm VAT, chụp ảnh/video chuyên nghiệp, nhập dữ liệu lớn, quảng cáo và phí API/dịch vụ phát sinh theo usage.

---

# 13. THỨ TỰ THỰC HIỆN TỐI ƯU

1. Backup và dọn repo/source/assets.
2. Chuyển UI sang Next.js + TypeScript, giữ visual parity.
3. Cấu hình static export + CI build ngoài TENTEN.
4. Thiết lập Supabase Free + RLS/Auth/Storage.
5. Catalog + product detail.
6. Admin/CMS tối giản.
7. Lead + upload + Telegram Edge Function.
8. SEO/performance/analytics.
9. Full regression + deploy TENTEN.
10. **Release A production.**
11. Chuẩn hóa dữ liệu/policy cho AI.
12. AI concierge chạy ngoài TENTEN + eval/guard.
13. **Release B production.**
14. Đo usage/lead/cost.
15. Chỉ khi có ROI rõ mới thêm AI nội bộ/vision.
16. **Full AI production.**

---

# 14. TOP 3 RỦI RO

## 1. Static publishing gây thêm bước rebuild

**Rủi ro:** sản phẩm mới không xuất hiện tức thì nếu page được generate tại build.

**Kiểm soát:** vì catalog nhỏ và thay đổi ít, ưu tiên rebuild/deploy; nếu tần suất tăng mới tự động hóa hoặc chuyển một phần sang dynamic/client fetch.

## 2. Supabase Free bị pause / thiếu backup tự động

**Rủi ro:** không phù hợp nếu website trở thành kênh doanh thu critical.

**Kiểm soát:** backup định kỳ; đo usage; khi uptime/backup trở thành yêu cầu kinh doanh thì nâng Pro.

## 3. AI/Media làm tăng chi phí hoặc tải hệ thống

**Rủi ro:** spam AI/upload gây chi phí và abuse.

**Kiểm soát:** media đi Supabase Storage; AI ngoài TENTEN; quota/rate limit/Turnstile/kill switch; không xử lý ảnh nặng trên hosting.

---

# 15. PHÁN QUYẾT

**[High] Kiến trúc tối ưu hiện tại:**

> **Next.js + TypeScript static-first trên TENTEN + Supabase Free cho DB/Auth/Storage/Edge Functions.**

Không chạy Node server thường trực ở Release A nếu không có use case bắt buộc.

**[High] Đây tốt hơn Next.js SSR/standalone ngay từ đầu cho website này** vì:

- catalog nhỏ;
- ít trang;
- dữ liệu cập nhật không liên tục;
- RAM/CPU/disk của hosting cần tiết kiệm;
- phần động có thể offload an toàn sang Supabase.

**[Medium] Chỉ chuyển sang `output: 'standalone'` khi static-first thực sự trở thành nút thắt vận hành, không chuyển vì lý do kiến trúc thuần túy.**
