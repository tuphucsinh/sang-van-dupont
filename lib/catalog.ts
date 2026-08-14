import { getSupabaseClient } from "./supabase";

export interface ProductMedia {
  url: string;
  kind: string;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name_vi: string;
  name_en: string;
  line: string | null;
  material: string | null;
  condition: string | null;
  desc_vi: string | null;
  desc_en: string | null;
  price: number | null;
  status: string;
  media: ProductMedia[];
}

type ProductRow = Omit<Product, "media">;
type MediaRow = ProductMedia & { product_id: string };

export async function getAllProducts(): Promise<Product[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  try {
    const { data: products, error: e1 } = await client
      .from("products")
      .select("*")
      .eq("status", "available")
      .order("slug");
    if (e1) {
      console.warn("[catalog] fetch products fail:", e1.message);
      return [];
    }
    if (!products?.length) return [];
    const ids = products.map((p) => p.id);
    const { data: media, error: e2 } = await client
      .from("product_media")
      .select("*")
      .in("product_id", ids)
      .order("sort_order");
    if (e2) {
      console.warn("[catalog] fetch media fail:", e2.message);
    }
    return (products as ProductRow[]).map((p) => ({
      ...p,
      media: (media as MediaRow[] | null)
        ?.filter((m) => m.product_id === p.id)
        .map(({ product_id, ...m }) => m) || [],
    }));
  } catch (err) {
    console.warn("[catalog] getAllProducts error:", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug) || null;
}

export async function getSimilarProducts(product: Product, limit = 3): Promise<Product[]> {
  const all = await getAllProducts();
  const sameLine = all.filter(
    (p) => p.slug !== product.slug && p.line && product.line && p.line === product.line
  );
  const rest = all.filter((p) => p.slug !== product.slug && !sameLine.includes(p));
  return [...sameLine, ...rest].slice(0, limit);
}
