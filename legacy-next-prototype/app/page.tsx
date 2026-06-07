import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Framework from "@/components/Framework";
import Agents from "@/components/Agents";
import CaseStudies from "@/components/CaseStudies";
import Stack from "@/components/Stack";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <TrustBar />
      <Framework />
      <Agents />
      <CaseStudies />
      <Stack />
      <Pricing />
      <Faq />
      <Contact />
      <Footer />
    </main>
  );
}
