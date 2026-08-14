# SangDupont — Các chức năng AI Hermes nên triển khai

## Mục tiêu

Dùng Hermes trên Pi5 như **AI operating layer** cho SangDupont: hỗ trợ nội dung, catalog, bán hàng, nghiên cứu thị trường, vận hành website và chăm sóc khách; website production vẫn giữ kiến trúc nhẹ.

---

## 1. AI Content / CMS nội bộ

- Nhận ảnh sản phẩm qua Hermes Desktop/Telegram.
- Tạo draft sản phẩm từ ảnh + thông tin người dùng cung cấp.
- Viết mô tả VI/EN.
- Tạo SEO title, meta description, alt text.
- Chuẩn hóa tên, SKU, category, tag, tình trạng, giá.
- Cập nhật trạng thái `available / reserved / sold`.
- Viết bài blog, case study, nội dung giới thiệu sản phẩm.
- Commit/push GitHub và kích hoạt pipeline cập nhật website sau khi được duyệt.

**Nguyên tắc:** authenticity, nguồn gốc, niên đại, giá bán và các claim quan trọng không được AI tự suy đoán rồi publish.

---

## 2. AI phân tích hình ảnh sản phẩm

- Phân tích đặc điểm nhìn thấy trên ảnh.
- Mô tả tình trạng: trầy, móp, oxy hóa, hao mòn, chi tiết ngoại hình.
- Nhận biết ảnh còn thiếu góc nào và yêu cầu chụp bổ sung.
- Hỗ trợ phân loại dòng/model sơ bộ.
- Tạo phiếu tiếp nhận/đánh giá sơ bộ.
- So sánh ảnh trước/sau bảo dưỡng.

**Không dùng AI làm kết luận cuối cùng về thật/giả hoặc định giá chính thức.**

---

## 3. Public Telegram Sales Concierge

Tạo một **profile Hermes riêng, giới hạn quyền**, kết nối Telegram Bot dành cho khách.

Chức năng:

- Chỉ trả lời về sản phẩm, dịch vụ và chính sách SangDupont.
- Tìm sản phẩm theo ngân sách, dòng, màu, tình trạng, mục đích sử dụng.
- So sánh 2–3 sản phẩm phù hợp.
- Trả đúng giá/tình trạng từ catalog canonical hiện tại.
- Giải thích dịch vụ, bảo dưỡng, quy trình mua bán.
- Thu tên, số điện thoại, nhu cầu, ngân sách.
- Tạo lead và handoff sang người thật.
- Nhận ảnh khách gửi để hỗ trợ tiếp nhận sản phẩm/bảo dưỡng.

### Giới hạn bắt buộc

- Không shell/terminal.
- Không filesystem write.
- Không Git/GitHub write.
- Không sửa website.
- Không tạo subagent.
- Không web search tự do nếu không cần.
- Không tự xác nhận thật/giả.
- Không tự cam kết giá mua/giá sửa/thời gian hoàn thành.
- Có rate limit, quota và chống spam.

---

## 4. AI Lead / CRM nhẹ

Hermes có thể:

- Chuẩn hóa lead thành dữ liệu có cấu trúc.
- Ghi nhu cầu, ngân sách, dòng sản phẩm quan tâm.
- Tóm tắt lịch sử trao đổi trước khi người thật tiếp nhận.
- Phân loại lead nóng/ấm/lạnh theo rule rõ ràng.
- Theo dõi trạng thái `new → contacted → qualified → won/lost`.
- Nhắc follow-up các lead chưa xử lý.
- Tìm lại khách từng quan tâm một dòng sản phẩm cụ thể.

**CRM lưu ở database có cấu trúc, không dùng MEMORY.md làm CRM.**

---

## 5. AI tiếp nhận bảo dưỡng / sửa chữa

Khách gửi ảnh + mô tả lỗi → Hermes:

1. Hỏi thêm thông tin còn thiếu.
2. Yêu cầu đúng góc ảnh cần bổ sung.
3. Tóm tắt hiện trạng.
4. Phân loại yêu cầu.
5. Tạo repair lead/ticket.
6. Chuyển hồ sơ hoàn chỉnh cho người xử lý.

---

## 6. AI Marketing Pipeline

Một bộ ảnh/thông tin đầu vào có thể tạo đồng thời:

- Product listing.
- Bài website.
- Facebook post.
- TikTok caption.
- Nội dung story/reel ngắn.
- Bản tiếng Anh.
- SEO metadata.
- Alt text.

Mục tiêu: **một nguồn dữ liệu → nhiều đầu ra**, giảm nhập nội dung lặp lại.

---

## 7. AI Website Operator

Hermes nội bộ có thể:

- Thêm/sửa/xóa nội dung sản phẩm.
- Kiểm tra link và ảnh hỏng.
- Kiểm tra nội dung VI/EN lệch nhau.
- Audit SEO cơ bản.
- Kiểm tra website sau deploy.
- Theo dõi GitHub Actions.
- Phát hiện deploy lỗi và báo nguyên nhân.
- Chuẩn bị rollback khi cần.
- Kiểm tra sitemap, metadata và structured content.

Workflow:

```text
Hermes trên Pi5
    ↓
Project local
    ↓
GitHub
    ↓
GitHub Actions build/test
    ↓
TENTEN
```

---

## 8. AI Market & Sourcing Research

Đây là nhóm chức năng có giá trị cao cho hoạt động mua bán.

### 8.1. Tìm nguồn hàng mới

Hermes Researcher có thể tìm kiếm định kỳ hoặc theo yêu cầu trên các nguồn được phép truy cập:

- website người bán;
- marketplace;
- cửa hàng/đại lý;
- diễn đàn và cộng đồng;
- Facebook/Instagram/X/Reddit khi có quyền truy cập phù hợp;
- auction/listing sites;
- nguồn nước ngoài.

Kết quả chuẩn hóa:

```text
Model / dòng
Tình trạng
Giá chào bán
Quốc gia/người bán
Ngày phát hiện
Ảnh/link nguồn
Chi phí vận chuyển ước tính (nếu có dữ liệu)
Mức độ phù hợp
Ghi chú/rủi ro
```

Hermes có thể xếp hạng các listing đáng xem nhất thay vì gửi toàn bộ kết quả thô.

### 8.2. Theo dõi người bán / đối thủ

Theo dõi danh sách seller/đối thủ đã chọn:

- có sản phẩm mới;
- sản phẩm nào vừa sold;
- thay đổi giá;
- giảm giá;
- dòng/model họ nhập nhiều;
- tần suất ra hàng;
- khoảng giá phổ biến;
- mặt hàng có vẻ bán nhanh.

Ví dụ báo cáo:

> Seller A vừa đăng 4 Ligne 2 mới, 2 chiếc giá thấp hơn mức trung bình gần đây khoảng 8–12%; có 1 listing phù hợp tiêu chí mua vào.

### 8.3. Price Intelligence

Hermes lưu lịch sử listing để:

- theo dõi giá theo model;
- median/range giá chào bán;
- so sánh theo condition;
- so sánh trong nước/quốc tế;
- phát hiện listing rẻ bất thường;
- phát hiện seller tăng/giảm giá;
- hỗ trợ xác định mức giá mua vào cần xem xét.

**Giá thị trường do AI tổng hợp chỉ là dữ liệu tham khảo, không phải định giá cuối cùng.**

### 8.4. Opportunity Detection

Hermes có thể cảnh báo khi phát hiện:

- model hiếm xuất hiện;
- giá thấp hơn ngưỡng đặt trước;
- seller uy tín vừa có hàng mới;
- listing mới phù hợp wishlist;
- bộ sưu tập/lô hàng có khả năng mua tốt;
- sản phẩm đang được thị trường hỏi nhiều nhưng SangDupont chưa có hàng.

Ví dụ rule:

```text
IF model = Ligne 2
AND condition >= target
AND asking_price <= threshold
AND seller_risk != high
→ alert
```

### 8.5. Competitor Intelligence

Theo dõi ở mức kinh doanh hợp pháp, dựa trên dữ liệu công khai/được phép truy cập:

- danh mục đối thủ đang bán;
- mức giá;
- sản phẩm mới;
- sản phẩm biến mất/sold;
- content họ đang đẩy mạnh;
- chương trình khuyến mãi;
- dịch vụ họ cung cấp;
- positioning và thông điệp marketing.

Hermes có thể tạo báo cáo ngắn:

```text
Có gì mới?
Giá thay đổi thế nào?
Đối thủ đang đẩy dòng nào?
Cơ hội cho SangDupont là gì?
Có listing nào đáng liên hệ/mua vào?
```

### 8.6. Watchlist

Có thể duy trì các watchlist:

- model cần săn;
- seller ưu tiên;
- đối thủ cần theo dõi;
- mức giá mục tiêu;
- quốc gia/nguồn hàng;
- keyword đặc biệt.

Chỉ thông báo khi có thay đổi đáng chú ý để tránh spam.

---

## 9. AI Business Analytics

Tổng hợp dữ liệu nội bộ + market research để trả lời:

- Dòng nào khách hỏi nhiều nhất?
- Dòng nào bán nhanh/chậm?
- Khoảng giá nào chuyển đổi tốt?
- Sản phẩm nào tồn lâu?
- Nên ưu tiên tìm thêm model nào?
- Giá của SangDupont đang cao/thấp thế nào so với thị trường quan sát được?
- Nguồn nào thường cho listing tốt?
- Đối thủ nào đang thay đổi chiến lược giá/danh mục?

Có thể tạo báo cáo tuần/tháng ngắn gọn với **action items**, không chỉ số liệu.

---

## 10. AI Knowledge Assistant nội bộ

Hermes có thể trở thành giao diện hỏi đáp cho toàn bộ dữ liệu SangDupont:

- catalog;
- FAQ;
- dịch vụ;
- policy;
- article;
- lead/CRM;
- repair records;
- nghiên cứu thị trường;
- watchlist seller/đối thủ.

Ví dụ:

> “Hiện có Ligne 2 bạc dưới 20 triệu nào?”

> “Trong 30 ngày qua nguồn nào có nhiều Ligne 2 giá tốt nhất?”

> “Đối thủ A vừa có hàng gì mới?”

> “Khách tháng này hỏi dòng nào nhiều nhưng mình đang thiếu hàng?”

---

# Kiến trúc vai trò đề xuất

```text
INTERNAL
Anh
 ↓
Hermes
 ├─ Content/CMS
 ├─ Image analysis
 ├─ Website operator
 ├─ Research/sourcing
 ├─ Competitor intelligence
 ├─ Analytics
 └─ Git operations
      ↓
    GitHub
      ↓
 GitHub Actions
      ↓
    TENTEN

PUBLIC
Khách
 ↓
Telegram Bot
 ↓
Restricted Hermes profile
 ├─ Product lookup (read-only)
 ├─ FAQ/service lookup
 ├─ Vision intake
 ├─ Create lead
 └─ Human handoff
      ↓
   Supabase
```

---

# Nguồn dữ liệu nên tách rõ

## Git / canonical content

- products;
- services;
- FAQ;
- policies;
- website content.

## Supabase

- leads;
- customer data;
- uploads;
- repair requests;
- CRM structured data.

## Research database

- seller/source;
- competitor;
- listing;
- observed price;
- first_seen / last_seen;
- status;
- source URL;
- watchlist;
- research notes.

**Không dùng MEMORY của Hermes làm nguồn sự thật cho giá, tồn kho, lead hoặc dữ liệu nghiên cứu.**

---

# Thứ tự triển khai đề xuất

1. **AI Content/CMS + image intake**.
2. **AI Website Operator + GitHub deployment workflow**.
3. **Public Telegram Sales Concierge**.
4. **Lead/CRM + handoff**.
5. **Research nguồn hàng + seller/competitor watchlist**.
6. **Price Intelligence + opportunity alerts**.
7. **Marketing automation**.
8. **Business analytics + báo cáo định kỳ**.

---

# Nguyên tắc chung

- AI hỗ trợ quyết định, không tự đưa ra claim thương mại quan trọng khi thiếu bằng chứng.
- Một nguồn dữ liệu canonical cho sản phẩm/giá/tình trạng.
- Public Hermes tối thiểu quyền; internal Hermes mới có quyền code/git.
- Research chỉ truy cập nguồn công khai hoặc nguồn tài khoản mà chủ sở hữu cho phép.
- Không bypass access control, CAPTCHA hoặc cơ chế chống bot trái phép.
- Mọi dữ liệu nguồn cần lưu URL + timestamp để có thể kiểm chứng.
- Ưu tiên alert chất lượng cao thay vì crawl càng nhiều càng tốt.

---

## Kết luận

Hermes có thể đảm nhiệm 4 lớp giá trị chính cho SangDupont:

1. **AI Content & Website Operations**.
2. **AI Sales & Customer Service**.
3. **AI Market/Sourcing/Competitor Intelligence**.
4. **AI Business Analytics & Decision Support**.

Trong đó, **Market & Sourcing Research** là phần rất đáng triển khai sau các workflow nội bộ cơ bản vì nó có thể trực tiếp hỗ trợ tìm hàng, phát hiện giá tốt và nhận biết nhu cầu thị trường sớm.
