import { About } from "@/components/sections/About";
import { AgentChat } from "@/components/sections/AgentChat";
import { Certifications } from "@/components/sections/Certifications";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { Navbar } from "@/components/ui/Navbar";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Navbar />
      {/* film grain over everything for depth */}
      <div aria-hidden className="noise pointer-events-none fixed inset-0 z-[55] opacity-[0.035] mix-blend-overlay" />
      <main className="relative z-10">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <AgentChat />
        <Certifications />
        <Contact />
      </main>
    </>
  );
}
