import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[catalog] thiếu NEXT_PUBLIC_SUPABASE_URL/ANON_KEY — trả null");
    return null;
  }
  client = createClient(url, key);
  return client;
}
