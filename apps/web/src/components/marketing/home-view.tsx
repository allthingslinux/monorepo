import { DonateSection } from "./donate-section";
import { EcosystemSection } from "./ecosystem-section";
import { HeroSection } from "./hero-section";
import { PortalSection } from "./portal-section";
import { StatsSection } from "./stats-section";
import { SupportersSection } from "./supporters-section";
import { TestimonialsSection } from "./testimonials-section";

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
      <PortalSection signInUrl={signInUrl} signUpUrl={signUpUrl} />
      <TestimonialsSection />
      <EcosystemSection portalSignUpUrl={signUpUrl} />
      <StatsSection />
      <SupportersSection />
      <DonateSection />
    </main>
  );
}