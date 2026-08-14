# HƯỚNG DẪN SỬ DỤNG TÍNH NĂNG AI — Phase 9B (SangDupont)

> 3 tính năng AI: **Vision intake** (khách bảo dưỡng) · **Admin draft** (viết mô tả) · **Recommend** (gợi ý theo tiêu chí).
> Model: AI chat = deepseek-v4-flash · AI vision = qwen3.7-plus (opencode-go).

---

## 1️⃣ AI VISION INTAKE — "Trợ lý tiếp nhận ảnh"

**Mục đích**: khách gửi ảnh bật lửa cần bảo dưỡng → AI xem ảnh, mô tả sơ bộ (thiếu góc nào, thấy khuyết điểm gì) → lưu vào lead để anh xử lý nhanh hơn.

### Luồng hoạt động
```
Khách vào website → chọn form "Bảo dưỡng" → tải ảnh lên
        ↓
AI xem ảnh (qwen3.7-plus, ~5-15s) → hiện "🤖 AI nhận xét sơ bộ" ngay trên form
        ↓
Khách điền tên + ĐT → Gửi
        ↓
Lead lưu vào DB kèm cột ai_summary + ảnh private → Telegram báo anh (text + ảnh + **🤖 AI sơ bộ** trong message — verified demo 14-08)
```

### Cách dùng (vai trò admin)
1. Khách gửi form → anh nhận Telegram như bình thường
2. Vào `/admin/leads` → mở lead type "maintenance" → cột **AI nhận xét** hiện summary (vd: "bật lửa dáng chữ nhật, mặt đen viền đồng — **ảnh thiếu góc đáy, 2 cạnh bên**; thấy oxy hóa nặng, bột trắng bám dày, bánh xe lửa mòn")
3. Dùng summary để: chuẩn bị trước khi gọi khách, yêu cầu khách gửi thêm góc ảnh còn thiếu

### Lưu ý
- AI **KHÔNG xác nhận thật/giả, không định giá, không khẳng định năm sản xuất** — chỉ mô tả hình ảnh
- Vision lỗi → form vẫn gửi được bình thường (không chặn khách)
- Ảnh vẫn nằm trong bucket private — chỉ anh (admin) xem được
- Mỗi IP tối đa 30 lượt/giờ (chống spam)

---

## 2️⃣ AI ADMIN DRAFT — "Viết mô tả bằng AI"

**Mục đích**: thêm sản phẩm mới → AI viết nháp mô tả VI/EN từ ảnh cover + tên → anh chỉnh sửa rồi lưu (AI chỉ tạo nháp, KHÔNG tự publish).

### Cách dùng
1. `/admin` → Products → **Thêm sản phẩm** (hoặc Sửa sản phẩm có ảnh)
2. Điền tên VI/EN + **upload/đính ảnh cover trước** (bắt buộc — AI cần ảnh)
3. Bấm nút **"✨ Draft mô tả bằng AI"** (cạnh ô mô tả)
4. Chờ ~10-20s → 2 ô `Mô tả VI` + `Mô tả EN` tự điền nháp
5. **Anh đọc, sửa lại cho đúng ý** (bổ sung thông tin thật: tình trạng, phụ kiện...) → bấm **Lưu**

### Ví dụ nháp AI tạo (từ ảnh thật + tên "Sơn mài đen huyền")
> VI: "Sơn mài đen huyền bóng sâu trên viền kim loại ánh vàng, chiếc S.T. Dupont vintage toát lên vẻ lịch lãm trầm mặc hiếm có..."
> EN: "Wrapped in deep, glossy black lacquer and framed by warm gold-toned metal, this vintage S.T. Dupont lighter exudes a quiet, timeless elegance..."

### Lưu ý
- **Bắt buộc có ảnh cover** trước khi bấm draft (không có → báo "Cần ảnh cover trước")
- AI **không bịa thông số cụ thể** (năm, số micron) — nếu cần anh tự thêm
- Mọi thay đổi vẫn qua nút Lưu — AI không tự động đăng sản phẩm

---

## 3️⃣ AI RECOMMEND — "Gợi ý sản phẩm theo tiêu chí" (trong AI chat)

**Mục đích**: khách hỏi "tìm bật lửa vàng, gọn, tầm 5 triệu" → **code lọc chính xác** từ catalog → AI viết lời giới thiệu (không bao giờ gợi ý bừa).

### Cách dùng (khách hàng — tự động, không cần làm gì)
Khách chat với widget 💬 (hoặc Telegram bot) các kiểu câu:
- "có bật lửa nào vàng, dáng gọn không?"
- "tìm mẫu Ligne 2 dưới 5 triệu"
- "mua tặng bố, thích kiểu sang trọng cổ điển"

AI sẽ: lọc đúng tiêu chí → giới thiệu 1-3 mẫu thật → hỏi nhu cầu / lấy SĐT chốt lead.

### Vai trò admin: đảm bảo dữ liệu đúng = recommend đúng
- **line / material / price / price_unit** trong sản phẩm phải điền chuẩn (từ `/admin/products`)
- Giá NULL → AI không lọc theo budget được (sẽ nói "giá đang cập nhật" — **nhập giá thật để recommend theo ngân sách hoạt động**)
- Status `available` = sản phẩm được gợi ý; `reserved`/`hidden` = không hiện

### Lưu ý
- AI **chỉ giới thiệu candidate mà code trả về** — không tự thêm/bớt sản phẩm
- Không có mẫu hợp tiêu chí → AI nói thật + hỏi ngân sách/gu khác

---

## ⚙️ Vận hành chung

| Việc | Lệnh/Thao tác |
|---|---|
| Tắt AI chat khẩn cấp (kill switch) | `supabase secrets set AI_ENABLED=false` → bật lại `=true` |
| Xem AI usage | Bảng `ai_chat_logs` (Supabase dashboard → SQL Editor: `SELECT date(created_at), count(*) FROM ai_chat_logs GROUP BY 1 ORDER BY 1 DESC;`) |
| Đổi model vision | `supabase secrets set AI_VISION_MODEL=<model>` (kiểm tra danh sách: GET opencode.ai/zen/go/v1/models) |
| Chi phí | AI chat: cap 100 lượt/ngày toàn site; vision: cap 30 lượt/giờ/IP — không có cảnh báo tiền riêng (trả theo lượt gọi, rất nhỏ) |
| Backup | Tự động CN 08:00 (cron) — `sangdupont-db/` giữ 7 bản |
