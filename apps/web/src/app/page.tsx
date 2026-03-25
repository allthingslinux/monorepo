import type { Metadata } from "next";

import { HomeView } from "@/components/marketing";
import { AppShell } from "@/components/shell";
import { getPortalSignInUrl, getPortalSignUpUrl } from "@/lib/portal-urls";

import { getPageMetadata } from "./metadata";

export const metadata: Metadata = getPageMetadata("home");

export default function Home() {
  return (
    <AppShell>
      <HomeView
        signInUrl={getPortalSignInUrl()}
        signUpUrl={getPortalSignUpUrl()}
      />
    </AppShell>
  );
}