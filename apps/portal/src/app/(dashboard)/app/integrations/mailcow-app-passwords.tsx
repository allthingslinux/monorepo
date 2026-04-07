"use client";

import { formatDate } from "@atl/utils/date";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Key, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  createAppPassword,
  deleteAppPassword,
  getAppPasswords,
} from "@/features/integrations/lib/mailcow/actions";
import { Badge } from "@atl/ui/components/badge";
import { Button } from "@atl/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@atl/ui/components/dialog";
import { Input } from "@atl/ui/components/input";

interface AppPasswordManagerProps {
  accountId: string;
}

export function AppPasswordManager({ accountId }: AppPasswordManagerProps) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: passwords = [], isLoading } = useQuery({
    queryFn: () => getAppPasswords(accountId),
    queryKey: ["mailcow", "passwords", accountId],
  });

  const handleCreate = async () => {
    if (!newName) {
      return;
    }
    try {
      setIsCreating(true);
      const result = await createAppPassword(accountId, newName);
      setGeneratedPassword(result.app_passwd);
      setNewName("");
      queryClient.invalidateQueries({
        queryKey: ["mailcow", "passwords", accountId],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create app password");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteAppPassword(accountId, id);
      toast.success("App password deleted");
      queryClient.invalidateQueries({
        queryKey: ["mailcow", "passwords", accountId],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete app password");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">App Passwords</h3>
        <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New App Password
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create App Password</DialogTitle>
              <DialogDescription>
                Generate a unique password for a mail client (e.g. Outlook,
                Thunderbird).
              </DialogDescription>
            </DialogHeader>
            {generatedPassword ? (
              <div className="space-y-4 py-4">
                <div className="border-success/20 bg-success/10 rounded-lg border p-4">
                  <p className="text-success mb-2 text-sm font-medium">
                    Password generated successfully!
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted flex-1 rounded p-2 font-mono text-lg select-all">
                      {generatedPassword}
                    </code>
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Copy this password now. It will not be shown again.
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setGeneratedPassword(null);
                    setIsDialogOpen(false);
                  }}
                >
                  Close
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="app-name">
                    App Name
                  </label>
                  <Input
                    id="app-name"
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. My Phone, Outlook"
                    value={newName}
                  />
                </div>
                <DialogFooter>
                  <Button
                    disabled={!newName || isCreating}
                    onClick={handleCreate}
                  >
                    {isCreating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Generate Password
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {passwords.length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed py-4 text-center text-sm">
              No app passwords created yet.
            </p>
          ) : (
            passwords.map((pw) => (
              <div
                className="hover:bg-accent/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                key={pw.id}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Key className="text-primary h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {pw.name || "Unnamed"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Created {pw.created ? formatDate(pw.created) : "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pw.active === 1 ? (
                    <Badge
                      className="border-success/20 bg-success/10 text-success"
                      variant="secondary"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                  <Button
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(pw.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
