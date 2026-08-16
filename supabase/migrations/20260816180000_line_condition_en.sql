-- i18n line/condition: thêm cột EN (fallback = cột VI khi null)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS line_en text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS condition_en text;

UPDATE public.products SET
  line_en = CASE line
    WHEN 'Ligne 1' THEN 'Ligne 1'
    WHEN 'Ligne 2' THEN 'Ligne 2'
    WHEN 'Phụ kiện' THEN 'Accessories'
    WHEN 'Vintage Collection' THEN 'Vintage Collection'
    WHEN 'Gatsby' THEN 'Gatsby'
    ELSE line END,
  condition_en = CASE condition
    WHEN 'Đã kiểm định' THEN 'Authenticated'
    WHEN 'Đã bảo dưỡng' THEN 'Serviced'
    ELSE condition END;
