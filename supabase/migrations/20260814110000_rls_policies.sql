-- RLS: enable mọi bảng
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- products: public chỉ đọc status=available; admin full
CREATE POLICY products_public_read ON products FOR SELECT USING (status = 'available');
CREATE POLICY products_admin_all ON products FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- product_media: public đọc media của product available (join); admin full
CREATE POLICY product_media_public_read ON product_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_media.product_id AND p.status = 'available')
);
CREATE POLICY product_media_admin_all ON product_media FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- content công khai: services, testimonials, case_studies, faq — public read, admin full
CREATE POLICY services_public_read ON services FOR SELECT USING (true);
CREATE POLICY services_admin_all ON services FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY testimonials_public_read ON testimonials FOR SELECT USING (true);
CREATE POLICY testimonials_admin_all ON testimonials FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY case_studies_public_read ON case_studies FOR SELECT USING (true);
CREATE POLICY case_studies_admin_all ON case_studies FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY faq_public_read ON faq FOR SELECT USING (true);
CREATE POLICY faq_admin_all ON faq FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- site_settings: public read, admin write
CREATE POLICY site_settings_public_read ON site_settings FOR SELECT USING (true);
CREATE POLICY site_settings_admin_all ON site_settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- leads + lead_attachments: CHỈ admin — KHÔNG public read
CREATE POLICY leads_admin_all ON leads FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY lead_attachments_admin_all ON lead_attachments FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Ghi chú (comment SQL): tắt public signup: Supabase Dashboard -> Authentication -> Providers -> Email -> disable "Allow new users to sign up" (thao tác UI, không phải SQL)
