import { SignedIn, SignedOut } from "@daveyplate/better-auth-ui";
import { createPageMetadata } from "@portal/seo/metadata";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { connection } from "next/server";

import { Button } from "@atl/ui/components/button";

import { AuthRedirect } from "./auth-redirect";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const t = await getTranslations();
  return createPageMetadata({
    description: t("marketing.homePage.metadataDescription"),
    title: t("marketing.homePage.metadataTitle"),
  });
}

// ============================================================================
// Home Page
// ============================================================================
// This page uses Better Auth UI components for conditional rendering based on
// authentication state. See: https://better-auth-ui.com/llms.txt
//
// Components:
//   - SignedOut: Renders content only when user is not authenticated
//   - SignedIn: Renders content only when user is authenticated
//   - UserButton: Complete user menu component with:
//     - User avatar
//     - Dropdown menu with account options
//     - Sign out functionality
//     - Settings link
//     - Profile information
//
// Alternative: You can use authClient.useSession() hook for more control:
//   const { data: session } = authClient.useSession();
//   if (!session) { ... } else { ... }

export default async function Page() {
  await connection();
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">{t("marketing.homePage.title")}</h1>
        <p className="text-muted-foreground text-xl">
          {t("marketing.homePage.description")}
        </p>
      </div>

      <SignedOut>
        <div className="flex gap-4">
          <Button nativeButton={false} render={<Link href="/auth/sign-in" />}>
            {t("navigation.signIn")}
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/auth/sign-up" />}
            variant="outline"
          >
            {t("navigation.signUp")}
          </Button>
        </div>
      </SignedOut>

      <SignedIn>
        <AuthRedirect to="/app" />
      </SignedIn>
    </div>
  );
}
