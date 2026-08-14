-- Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('lead-attachments', 'lead-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- product-images: public read, admin/Edge write (không public write)
CREATE POLICY product_images_public_read ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY product_images_admin_all ON storage.objects FOR ALL USING (bucket_id = 'product-images' AND auth.role() = 'authenticated') WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- lead-attachments: private bucket — policy admin-only được tạo trong 20260814130000_admin_rls.sql
-- (KHÔNG tạo policy ở đây — tránh phụ thuộc thứ tự migration với is_admin())
