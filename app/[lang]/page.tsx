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

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "vi" }, { lang: "en" }];
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
      <link rel="preload" as="image" href="/assets/img/hero.jpg" />
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
