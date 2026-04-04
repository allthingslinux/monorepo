import { ChatSection } from "./chat-section";
import { DonateSection } from "./donate-section";
import { EcosystemSection } from "./ecosystem-section";
import { HeroSection } from "./hero-section";
import { PortalSection } from "./portal-section";
import { ShSection } from "./sh-section";
import { StatsSection } from "./stats-section";
import { TestimonialsSection } from "./testimonials-section";
import { ToolsSection } from "./tools-section";
import { WikiSection } from "./wiki-section";

export function HomeView({
  signInUrl,
  signUpUrl,
}: {
  signInUrl: string;
  signUpUrl: string;
}) {
  return (
    <main className="w-full">
      <HeroSection />
      <StatsSection />
      <PortalSection signInUrl={signInUrl} signUpUrl={signUpUrl} />
      <ToolsSection />
      <ShSection />
      <ChatSection />
      <WikiSection />
      <EcosystemSection />
      <TestimonialsSection />
      <DonateSection />
    </main>
  );
}
