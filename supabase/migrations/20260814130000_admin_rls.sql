-- Admin RLS: allowlist email duy nhất tvccbod@gmail.com (D18)
-- Thay mọi policy write cũ (auth.role()='authenticated' — lỗ hổng: bất kỳ authenticated nào cũng write)
-- Public read giữ nguyên.

-- Helper xác định admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT coalesce(auth.jwt() ->> 'email', '') = 'tvccbod@gmail.com'
$$;

-- Drop policy cũ theo role authenticated
DROP POLICY IF EXISTS products_admin_all ON products;
DROP POLICY IF EXISTS product_media_admin_all ON product_media;
DROP POLICY IF EXISTS services_admin_all ON services;
DROP POLICY IF EXISTS testimonials_admin_all ON testimonials;
DROP POLICY IF EXISTS case_studies_admin_all ON case_studies;
DROP POLICY IF EXISTS faq_admin_all ON faq;
DROP POLICY IF EXISTS site_settings_admin_all ON site_settings;
DROP POLICY IF EXISTS leads_admin_all ON leads;
DROP POLICY IF EXISTS lead_attachments_admin_all ON lead_attachments;
DROP POLICY IF EXISTS product_images_admin_all ON storage.objects;
DROP POLICY IF EXISTS lead_attachments_admin_all ON storage.objects;

-- Recreate: write CHỈ khi is_admin()
CREATE POLICY products_admin_all ON products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY product_media_admin_all ON product_media FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY services_admin_all ON services FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY testimonials_admin_all ON testimonials FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY case_studies_admin_all ON case_studies FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY faq_admin_all ON faq FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY site_settings_admin_all ON site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY leads_admin_all ON leads FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY lead_attachments_admin_all ON lead_attachments FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY product_images_admin_all ON storage.objects FOR ALL USING (bucket_id = 'product-images' AND public.is_admin()) WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY lead_attachments_admin_all ON storage.objects FOR ALL USING (bucket_id = 'lead-attachments' AND public.is_admin()) WITH CHECK (bucket_id = 'lead-attachments' AND public.is_admin());

-- Ghi chú: muốn thêm admin → sửa hàm is_admin() + migration mới (allowlist duy nhất).
