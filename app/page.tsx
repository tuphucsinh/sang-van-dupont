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

export default function HomePage() {
  return (
    <I18nProvider>
      <Nav />
      <Hero />
      <Marquee />
      <Collection />
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
