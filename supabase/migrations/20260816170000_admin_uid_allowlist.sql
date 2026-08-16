-- R15: is_admin theo auth.uid() allowlist (thay vì email claim trong JWT)
-- Chống: user đăng ký email trùng allowlist thành admin (V18)

-- Bảng allowlist admin uid
CREATE TABLE IF NOT EXISTS public.admin_uids (
  uid uuid PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed 2 admin hiện tại (idempotent — ON CONFLICT DO NOTHING)
INSERT INTO public.admin_uids (uid, email) VALUES
  ('ce4d0405-f30d-4d93-84ab-78002c7a3234', 'aivntps@gmail.com'),
  ('483d9761-aec9-47ed-996b-aad2a0df7adc', 'tvccbod@gmail.com')
ON CONFLICT (uid) DO NOTHING;

-- Bỏ quyền anon/public trên bảng allowlist (chỉ service_role đọc)
ALTER TABLE public.admin_uids ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_uids FROM anon, authenticated, public;
GRANT SELECT ON public.admin_uids TO service_role;

-- Hàm is_admin mới: so auth.uid() với allowlist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_uids WHERE uid = auth.uid()
  );
$$;

-- Đảm bảo execution permission cho roles dùng policy
-- LƯU Ý: policy FOR ALL USING (is_admin()) đánh giá dưới role của request (gồm anon khi SELECT public bảng có policy)
-- → phải grant cho anon (hàm trả false với anon vì auth.uid() null — an toàn, không lộ gì)
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
