import { I18nProvider } from "@/components/I18nProvider";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Collection from "@/components/Collection";
import About from "@/components/About";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Lightbox from "@/components/Lightbox";
import Footer from "@/components/Footer";
import SparksClient from "@/components/SparksClient";
import RevealClient from "@/components/RevealClient";
import { getAllProducts } from "../../lib/catalog";
import type { Metadata } from "next";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "vi" }, { lang: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  return {
    title: isEn
      ? "ST DUPONT VINTAGE — Sang Van | Vintage S.T. Dupont Lighters"
      : "ST DUPONT VINTAGE — Sang Van · Bật lửa sưu tầm chính hãng",
    description: isEn
      ? "Authentic vintage S.T. Dupont lighters — French artistry, curated, inspected and serviced in Vietnam."
      : "Sưu tầm & bảo dưỡng bật lửa S.T. Dupont vintage chính hãng — Tinh hoa nước Pháp, gửi đến Việt Nam.",
    alternates: {
      canonical: isEn ? "/en" : "/vi",
      languages: {
        vi: "https://sangdupont.vercel.app/vi",
        en: "https://sangdupont.vercel.app/en",
      },
    },
    openGraph: {
      title: isEn
        ? "ST DUPONT VINTAGE — Sang Van | Vintage S.T. Dupont Lighters"
        : "ST DUPONT VINTAGE — Sang Van",
      description: isEn
        ? "Authentic vintage S.T. Dupont lighters — French artistry, curated, inspected and serviced in Vietnam."
        : "Bật lửa S.T. Dupont vintage chính hãng — sưu tầm, kiểm định, bảo dưỡng",
      siteName: "SangDupont",
      locale: isEn ? "en_US" : "vi_VN",
      type: "website",
      images: [{ url: "/assets/img/hero.jpg", width: 1200, height: 630 }],
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const products = await getAllProducts();

  return (
    <I18nProvider initialLang={(lang === "en" ? "en" : "vi") as "vi" | "en"}>
      <Nav />
      <Hero />
      <Marquee />
      <Collection products={products} lang={(lang === "en" ? "en" : "vi") as "vi" | "en"} />
      <About />
      <Services />
      <Contact />
      <Lightbox />
      <Footer />
      <SparksClient />
      <RevealClient />
    </I18nProvider>
  );
}
