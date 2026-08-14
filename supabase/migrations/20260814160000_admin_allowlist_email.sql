-- P9X: mở rộng allowlist admin — thêm aivntps@gmail.com (login email/password, cùng GitHub tvccbod@gmail.com)
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT coalesce(auth.jwt() ->> 'email', '') IN ('tvccbod@gmail.com', 'aivntps@gmail.com')
$$;
