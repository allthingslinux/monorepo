import { AppShell } from "@/components/app-shell";
import { services } from "@atl/tools-manifest";

export default function HomePage() {
  return <AppShell services={services} />;
}
