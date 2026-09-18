import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { TechStackSection } from "@/components/landing/tech-stack";
import { CtaSection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <TechStackSection />
      <CtaSection />
    </main>
  );
}
