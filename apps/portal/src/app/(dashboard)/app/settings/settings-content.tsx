"use client";

// ============================================================================
// Settings Content (Client Component)
// ============================================================================
// Client Component wrapper for Better Auth UI settings components.
// Uses dynamic imports with ssr: false to prevent hydration mismatches.
// Tab (account / security / api-keys) is synced to URL via nuqs so deep links
// and back/forward work.

import dynamic from "next/dynamic";

import { useSession } from "@atl/auth/session-context";
import { Card } from "@atl/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@atl/ui/components/tabs";

import type { SettingsTabUrlState } from "./settings-search-params";
import { useSettingsSearchParams } from "./use-settings-search-params";

// ============================================================================
// Settings Content Component
// ============================================================================
// This component contains the tabs and Better Auth UI settings components.
// It's a Client Component because we disable SSR for Better Auth UI components.

const UpdateAvatarCard = dynamic(
  async () => {
    const m = await import("@daveyplate/better-auth-ui");
    return { default: m.UpdateAvatarCard };
  },
  {
    ssr: false,
  }
);

const UpdateNameCard = dynamic(
  async () => {
    const m = await import("@daveyplate/better-auth-ui");
    return { default: m.UpdateNameCard };
  },
  {
    ssr: false,
  }
);

const ChangeEmailCard = dynamic(
  async () => {
    const m = await import("@daveyplate/better-auth-ui");
    return { default: m.ChangeEmailCard };
  },
  {
    ssr: false,
  }
);

const ProvidersCard = dynamic(
  async () => {
    const m = await import("@daveyplate/better-auth-ui");
    return { default: m.ProvidersCard };
  },
  {
    ssr: false,
  }
);

const UpdateUsernameCard = dynamic(
  async () => {
    const m = await import("@daveyplate/better-auth-ui");
    return { default: m.UpdateUsernameCard };
  },
  {
    ssr: false,
  }
);

const SecuritySettingsCards = dynamic(
  async () => {
    const m = await import("@daveyplate/better-auth-ui");
    return { default: m.SecuritySettingsCards };
  },
  {
    ssr: false,
  }
);

const ApiKeysCard = dynamic(
  async () => {
    const m = await import("@daveyplate/better-auth-ui");
    return { default: m.ApiKeysCard };
  },
  {
    ssr: false,
  }
);

export function SettingsContent() {
  const [urlState, setUrlState] = useSettingsSearchParams();
  const { session } = useSession();
  const username = session?.user
    ? (session.user as { username?: string | null }).username
    : null;

  return (
    <div className="max-w-4xl">
      <Tabs
        onValueChange={(value) =>
          setUrlState({ tab: value as SettingsTabUrlState["tab"] })
        }
        value={urlState.tab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6 space-y-6" value="account">
          <UpdateAvatarCard />
          {username ? (
            <Card className="p-6">
              <p className="text-muted-foreground">Username</p>
              <p className="mt-1 font-mono text-base">{username}</p>
              <p className="text-muted-foreground">
                Username is locked after it is set.
              </p>
            </Card>
          ) : (
            <UpdateUsernameCard />
          )}
          <UpdateNameCard />
          <ChangeEmailCard />
          <ProvidersCard />
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="security">
          <SecuritySettingsCards />
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="api-keys">
          <ApiKeysCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
