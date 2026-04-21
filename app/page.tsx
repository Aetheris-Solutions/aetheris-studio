import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import Agents from "@/components/Agents";
import Method from "@/components/Method";
import Results from "@/components/Results";
import Quote from "@/components/Quote";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Philosophy />
      <Agents />
      <Method />
      <Quote />
      <Results />
      <Contact />
      <Footer />
    </main>
  );
}
