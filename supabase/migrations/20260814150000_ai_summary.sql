-- P9T01: leads.ai_summary — AI vision intake (mô tả sơ bộ ảnh bảo dưỡng)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ai_summary text;
