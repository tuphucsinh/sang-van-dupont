/**
 * P11T01 — Load 1 sản phẩm + media từ Supabase (service role) cho Marketing Pipeline.
 * CLI: npx tsx scripts/marketing/load-product.ts <slug>
 * Output: MarketingProduct JSON (VI/EN, price nullable, media sorted).
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

export interface MarketingMedia {
  url: string;
  kind: string;
  sortOrder: number;
}

export interface MarketingProduct {
  slug: string;
  nameVi: string;
  nameEn: string;
  line: string | null;
  material: string | null;
  year: number | null;
  condition: string | null;
  descVi: string | null;
  descEn: string | null;
  price: number | null;
  status: string;
  media: MarketingMedia[];
}

/** Parse file .env.local đơn giản (KHÔNG in giá trị ra đâu khác ngoài usage). */
function loadEnvFile(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !m[1].startsWith("#")) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

export function marketingEnv(): { url: string; key: string } {
  const env = loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  const url = env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  }
  return { url, key };
}

export async function loadProduct(slug: string): Promise<MarketingProduct | null> {
  const { url, key } = marketingEnv();
  const supabase = createClient(url, key);

  const { data: p, error } = await supabase
    .from("products")
    .select("id, slug, name_vi, name_en, line, material, year, condition, desc_vi, desc_en, price, status")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Query products fail: ${error.message}`);
  if (!p) return null;

  const { data: media, error: mediaErr } = await supabase
    .from("product_media")
    .select("url, kind, sort_order")
    .eq("product_id", p.id)
    .order("sort_order", { ascending: true });
  if (mediaErr) throw new Error(`Query product_media fail: ${mediaErr.message}`);

  return {
    slug: p.slug,
    nameVi: p.name_vi,
    nameEn: p.name_en,
    line: p.line ?? null,
    material: p.material ?? null,
    year: p.year ?? null,
    condition: p.condition ?? null,
    descVi: p.desc_vi ?? null,
    descEn: p.desc_en ?? null,
    price: p.price === null || p.price === undefined ? null : Number(p.price),
    status: p.status,
    media: (media ?? []).map((m) => ({ url: m.url, kind: m.kind, sortOrder: m.sort_order })),
  };
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: npx tsx scripts/marketing/load-product.ts <slug>");
    process.exit(1);
  }
  loadProduct(slug)
    .then((p) => {
      if (!p) {
        console.error(`Không tìm thấy sản phẩm: ${slug}`);
        process.exit(1);
      }
      console.log(JSON.stringify(p, null, 2));
    })
    .catch((e) => {
      console.error("Lỗi:", e.message);
      process.exit(1);
    });
}
