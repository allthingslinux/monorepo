"use client";

import { Button } from "@atl/ui/components/button";
import { captureException, startSpan } from "@sentry/nextjs";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import type { IrcAccount } from "@/features/integrations/lib/irc/types";

interface IrcAccountDetailsProps {
  account: IrcAccount;
}

export function IrcAccountDetails({ account }: IrcAccountDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Nick</p>
          <p className="font-mono text-sm">{account.nick}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Server</p>
          <div className="flex items-center gap-1">
            <code className="font-mono text-sm">
              {account.server}:{account.port}
            </code>
            <Button
              aria-label="Copy connect string"
              className="h-6 w-6 p-0"
              onClick={async () => {
                await startSpan(
                  {
                    attributes: { integrationId: "irc" },
                    name: "Copy IRC connect string",
                    op: "ui.action",
                  },
                  async () => {
                    try {
                      const text = `${account.server}:${account.port}`;
                      if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(text);
                      } else {
                        const ta = document.createElement("textarea");
                        ta.value = text;
                        document.body.append(ta);
                        ta.select();
                        if (!document.execCommand("copy")) {
                          throw new Error("execCommand copy failed");
                        }
                        ta.remove();
                      }
                      toast.success("Copied", {
                        description: "Connect string copied",
                      });
                    } catch (error) {
                      captureException(error);
                      toast.error("Failed to copy");
                    }
                  }
                );
              }}
              size="sm"
              variant="ghost"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            TLS · /msg NickServ IDENTIFY nick &lt;password&gt;
          </p>
        </div>
      </div>
    </div>
  );
}