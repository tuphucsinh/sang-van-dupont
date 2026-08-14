-- SangDupont catalog seed — 9 sản phẩm thật từ landing (I18N dict p1–p9)
-- Ảnh: file hiện có /assets/img/ (D15 — serve static, không Storage)
-- price NULL = "Liên hệ" (D17 — không bịa giá)
-- Status: 8 available + 1 reserved (test badge Phase sau khi có admin; RLS public chỉ đọc available)

INSERT INTO products (slug, name_vi, name_en, line, material, condition, desc_vi, desc_en, price, status) VALUES
('l2-diamond-80s', 'L2 Diamond Thập niên 80', 'L2 Diamond · 1980s', 'Ligne 2', 'Mạ vàng 20 microns', 'Đã kiểm định', 'Bật lửa Ligne 2 thập niên 80, mạ vàng 20 microns, dòng Diamond Head kinh điển. Âm mở nắp đặc trưng, đã bảo dưỡng cơ chế.', 'Ligne 2 lighter from the 1980s, 20-micron gold plated, classic Diamond Head line. Signature ping sound, ignition serviced.', NULL, 'available'),
('ligne1-guilloche', 'Ligne 1 Guilloché', 'Ligne 1 Guilloché', 'Ligne 1', 'Mạ vàng champagne', 'Đã kiểm định', 'Ligne 1 với khắc guilloché tinh xảo, lớp mạ vàng champagne. Dáng nhỏ gọn cổ điển, phù hợp sưu tầm hằng ngày.', 'Ligne 1 with fine guilloché engraving, champagne gold plating. Classic compact silhouette, ideal for daily collecting.', NULL, 'available'),
('black-lacquer', 'Sơn mài đen huyền', 'Black lacquer noir', 'Ligne 1', 'Sơn mài + viền kim loại', 'Đã kiểm định', 'Sơn mài đen huyền viền kim loại sáng, vẻ đẹp huyền bí Pháp. Lớp sơn mài được kiểm tra và chăm sóc.', 'Mysterious black lacquer with polished metal trim, French elegance. Lacquer inspected and cared for.', NULL, 'available'),
('green-black-classic', 'Xanh đen cổ điển', 'Classic green-black', 'Vintage Collection', 'Sơn mài + kim loại', 'Đã kiểm định', 'Tông xanh đen cổ điển thuộc dòng Vintage Collection, cá tính và hiếm gặp.', 'Classic green-black tone from the Vintage Collection, distinctive and rare.', NULL, 'available'),
('gatsby-90s', 'Gatsby thập niên 90', 'Gatsby · 1990s', 'Gatsby', 'Bọc vàng guilloché', 'Đã kiểm định', 'Gatsby thập niên 90 bọc vàng guilloché, dáng đặc trưng của dòng Gatsby danh giá.', '1990s Gatsby with gold guilloché, the iconic Gatsby silhouette.', NULL, 'available'),
('l2-diamond-fluted', 'L2 Diamond · Vàng khía', 'L2 Diamond · Fluted gold', 'Ligne 2', 'Mạ vàng khía', 'Đã kiểm định', 'L2 Diamond vàng khía, đi kèm hộp và phụ kiện. Chi tiết khía vàng bắt sáng đẹp mắt.', 'L2 Diamond with fluted gold detail, box and accessories included. Fluted gold catches light beautifully.', NULL, 'available'),
('brand-hallmarks', 'Dấu khắc thương hiệu', 'Brand hallmarks', 'Phụ kiện', 'Kim loại khắc', 'Đã kiểm định', 'Chi tiết dấu khắc thương hiệu — Paris · Made in France. Minh chứng nguồn gốc và giá trị sưu tầm.', 'Brand hallmark details — Paris · Made in France. Proof of provenance and collecting value.', NULL, 'available'),
('ignition-mechanism', 'Cơ chế đánh lửa', 'Ignition mechanism', 'Phụ kiện', 'Kim loại cơ khí', 'Đã bảo dưỡng', 'Cơ chế đánh lửa sau bảo dưỡng tận tay — ngọn lửa bùng cháy đúng nhịp Pháp. Minh họa quy trình phục hồi.', 'Ignition mechanism after hand servicing — flame burning with French precision. Illustration of the restoration process.', NULL, 'available'),
('collector-set', 'Bộ sưu tầm đi kèm', 'Collector''s set', 'Vintage Collection', 'Hộp · Bao da · Phụ kiện', 'Đã kiểm định', 'Bộ sưu tầm đi kèm: hộp, bao da và phụ kiện — trọn vẹn cho người sưu tầm.', 'Collector''s set: box, leather pouch and accessories — complete for the collector.', NULL, 'reserved');

INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_04.jpg', 'cover', 0 FROM products WHERE slug = 'l2-diamond-80s';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_12.jpg', 'gallery', 1 FROM products WHERE slug = 'l2-diamond-80s';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_01.jpg', 'cover', 0 FROM products WHERE slug = 'ligne1-guilloche';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_02.jpg', 'gallery', 1 FROM products WHERE slug = 'ligne1-guilloche';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_08.jpg', 'cover', 0 FROM products WHERE slug = 'black-lacquer';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_03.jpg', 'gallery', 1 FROM products WHERE slug = 'black-lacquer';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_05.jpg', 'cover', 0 FROM products WHERE slug = 'green-black-classic';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_08.jpg', 'gallery', 1 FROM products WHERE slug = 'green-black-classic';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_12.jpg', 'cover', 0 FROM products WHERE slug = 'gatsby-90s';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_04.jpg', 'gallery', 1 FROM products WHERE slug = 'gatsby-90s';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_13.jpg', 'cover', 0 FROM products WHERE slug = 'l2-diamond-fluted';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_11.jpg', 'gallery', 1 FROM products WHERE slug = 'l2-diamond-fluted';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_03.jpg', 'cover', 0 FROM products WHERE slug = 'brand-hallmarks';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_01.jpg', 'gallery', 1 FROM products WHERE slug = 'brand-hallmarks';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_02.jpg', 'cover', 0 FROM products WHERE slug = 'ignition-mechanism';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_08.jpg', 'gallery', 1 FROM products WHERE slug = 'ignition-mechanism';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_11.jpg', 'cover', 0 FROM products WHERE slug = 'collector-set';
INSERT INTO product_media (product_id, url, kind, sort_order)
SELECT id, '/assets/img/img_13.jpg', 'gallery', 1 FROM products WHERE slug = 'collector-set';
