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
import { getAllProducts } from "../lib/catalog";
import AiChat from "../components/AiChat";

export default async function Home() {
  const products = await getAllProducts();

  return (
    <I18nProvider>
      <link rel="preload" as="image" href="/assets/img/hero.jpg" />
      <Nav />
      <Hero />
      <Marquee />
      <Collection products={products} />
      <About />
      <Services />
      <Contact />
      <Lightbox />
      <Footer />
      <SparksClient />
      <RevealClient />
      <AiChat />
    </I18nProvider>
  );
}
