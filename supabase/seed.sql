-- Supabase Seed Data for Development & Testing
-- Prefix: [SEED] for all test/mock records

-- 1. Products (2 available items)
INSERT INTO products (
  slug,
  name_vi,
  name_en,
  line,
  material,
  year,
  condition,
  desc_vi,
  desc_en,
  price,
  status
) VALUES
(
  'seed-l2-diamond',
  '[SEED] Bật lửa Dupont L2 Kim Cương Vàng Hồng',
  '[SEED] S.T. Dupont Ligne 2 Rose Gold Diamond Head',
  'Ligne 2',
  'Rose Gold Plated',
  2021,
  'New 99%',
  'Bật lửa S.T. Dupont Ligne 2 hoạ tiết Diamond Head mạ vàng hồng cao cấp, âm mở nắp vang trong đặc trưng.',
  'S.T. Dupont Ligne 2 lighter with classic diamond head pattern in rose gold finish, crisp signature ping sound.',
  24500000,
  'available'
),
(
  'seed-gatsby-silver',
  '[SEED] Bật lửa Dupont Gatsby Vân Bạc Kẻ Sọc',
  '[SEED] S.T. Dupont Gatsby Silver Striped',
  'Gatsby',
  'Silver Plated',
  2019,
  'Like New 98%',
  'Dòng Gatsby nhỏ gọn thanh lịch, chất liệu mạ bạc vân sọc dọc tinh xảo, đầy đủ hộp sổ zin.',
  'Compact and elegant Gatsby lighter with vertical striped silver plating, complete original box and papers.',
  18500000,
  'available'
);

-- 2. FAQ (1 item)
INSERT INTO faq (
  question_vi,
  question_en,
  answer_vi,
  answer_en,
  sort_order
) VALUES
(
  '[SEED] Làm thế nào để phân biệt bật lửa Dupont chính hãng?',
  '[SEED] How to authenticate a genuine S.T. Dupont lighter?',
  '[SEED] Bật lửa chính hãng có số serial khắc tay sắc nét dưới đáy, trọng lượng đầm tay, âm mở nắp trong trẻo đặc trưng và lớp mạ hoàn thiện tỉ mỉ.',
  '[SEED] Authentic lighters feature crisp hand-stamped serial numbers on the base, substantial weight, a signature clear ping sound upon opening, and impeccable plating finish.',
  1
);

-- 3. Testimonials (1 item)
INSERT INTO testimonials (
  name_vi,
  name_en,
  content_vi,
  content_en,
  sort_order
) VALUES
(
  '[SEED] Anh Tuấn (Hà Nội)',
  '[SEED] Mr. Tuan (Hanoi)',
  '[SEED] Dịch vụ bảo dưỡng và phục hồi bật lửa Dupont cực kỳ chuyên nghiệp, tiếng mở nắp sau khi tinh chỉnh rất vang và ưng ý.',
  '[SEED] Extremely professional Dupont restoration and maintenance service. The ping sound after adjustment is crisp and resonant.',
  1
);

-- 4. Leads (1 item - used for RLS test, only accessible by authenticated admin)
INSERT INTO leads (
  type,
  name,
  phone,
  budget,
  need,
  line_interest,
  channel,
  status,
  meta
) VALUES
(
  'buy',
  '[SEED] Nguyễn Văn Mẫu',
  '0901234567',
  '20.000.000 - 30.000.000 VND',
  'Tìm mua dòng Ligne 2 mạ vàng âm hay',
  'Ligne 2',
  'web_form',
  'new',
  '{"note": "Khách cần giao gấp trong ngày tại TP.HCM", "test_rls": true}'::jsonb
);
