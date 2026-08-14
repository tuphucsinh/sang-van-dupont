import type { MetadataRoute } from "next";
import { getAllProducts } from "../lib/catalog";

// output:'export' bắt buộc force-static cho route đặc biệt
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const base = "https://sangdupont.vercel.app";
  const entries: MetadataRoute.Sitemap = [
    {
      url: base + "/",
      lastModified: new Date(),
    },
  ];

  for (const p of products) {
    entries.push({
      url: `${base}/vi/products/${p.slug}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: `${base}/vi/products/${p.slug}`,
          en: `${base}/en/products/${p.slug}`,
        },
      },
    });
    entries.push({
      url: `${base}/en/products/${p.slug}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: `${base}/vi/products/${p.slug}`,
          en: `${base}/en/products/${p.slug}`,
        },
      },
    });
  }

  return entries;
}
