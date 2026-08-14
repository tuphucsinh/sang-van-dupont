import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getSimilarProducts,
  getAllProducts,
} from "../../../../lib/catalog";
import ProductDetail from "../../../../components/ProductDetail";
import Contact from "@/components/Contact";

export const dynamicParams = false; // 404 cho slug lạ (static export)

export async function generateStaticParams(): Promise<{ lang: string; slug: string }[]> {
  const all = await getAllProducts();
  return all.flatMap((p) => [
    { lang: "vi", slug: p.slug },
    { lang: "en", slug: p.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Không tìm thấy" };

  const name = lang === "en" ? p.name_en : p.name_vi;
  const desc = lang === "en" ? p.desc_en : p.desc_vi;

  return {
    title: name + " — Sang Van",
    description: desc || undefined,
    alternates: {
      canonical: `/vi/products/${p.slug}`,
      languages: {
        vi: `https://sangdupont.vercel.app/vi/products/${p.slug}`,
        en: `https://sangdupont.vercel.app/en/products/${p.slug}`,
      },
    },
    openGraph: {
      title: name,
      description: desc || undefined,
      images: p.media[0]?.url ? [{ url: p.media[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const similar = await getSimilarProducts(product, 3);
  return (
    <>
      <ProductDetail
        product={product}
        lang={lang as "vi" | "en"}
        similar={similar}
      />
      <Contact />
    </>
  );
}
