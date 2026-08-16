// Allowlist admin duy nhất (R17 — đồng bộ với supabase/migrations/20260814160000_admin_allowlist_email.sql)
export const ADMIN_EMAILS = ["tvccbod@gmail.com", "aivntps@gmail.com"] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && (ADMIN_EMAILS as readonly string[]).includes(email);
}
