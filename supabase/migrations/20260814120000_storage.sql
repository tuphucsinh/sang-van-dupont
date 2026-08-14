-- Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('lead-attachments', 'lead-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- product-images: public read, admin/Edge write (không public write)
CREATE POLICY product_images_public_read ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY product_images_admin_all ON storage.objects FOR ALL USING (bucket_id = 'product-images' AND auth.role() = 'authenticated') WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- lead-attachments: CHỈ admin (private) — không public read
CREATE POLICY lead_attachments_admin_all ON storage.objects FOR ALL USING (bucket_id = 'lead-attachments' AND auth.role() = 'authenticated') WITH CHECK (bucket_id = 'lead-attachments' AND auth.role() = 'authenticated');
