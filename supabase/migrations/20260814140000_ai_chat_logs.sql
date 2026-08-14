-- ai_chat_logs — log usage AI chat (rate limit + cost cap) — P8T02
CREATE TABLE IF NOT EXISTS public.ai_chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash text NOT NULL,
  response_preview text,
  tokens integer DEFAULT 0,
  ip text,
  status integer DEFAULT 200,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_chat_logs_ip_created_idx ON public.ai_chat_logs (ip, created_at);
CREATE INDEX IF NOT EXISTS ai_chat_logs_created_idx ON public.ai_chat_logs (created_at);

ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;
-- Không ai đọc/ghi qua client — chỉ Edge Function (service role bypass RLS)
