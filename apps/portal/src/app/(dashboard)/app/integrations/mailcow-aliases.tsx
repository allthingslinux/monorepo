"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe, Loader2, Mail, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  createAlias,
  deleteAlias,
  getAliases,
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

interface AliasManagerProps {
  accountId: string;
  email: string;
}

export function AliasManager({ accountId, email: _email }: AliasManagerProps) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [address, setAddress] = useState("");
  const [goto, setGoto] = useState("");
  const [comment, setComment] = useState("");

  const { data: aliases = [], isLoading } = useQuery({
    queryFn: () => getAliases(accountId),
    queryKey: ["mailcow", "aliases", accountId],
  });

  const handleCreate = async () => {
    if (!(address && goto)) {
      return;
    }
    try {
      setIsCreating(true);
      await createAlias(accountId, {
        active: true,
        address,
        goto,
        public_comment: comment,
      });
      toast.success("Alias created");
      setAddress("");
      setGoto("");
      setComment("");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["mailcow", "aliases", accountId],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create alias");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteAlias(accountId, id);
      toast.success("Alias deleted");
      queryClient.invalidateQueries({
        queryKey: ["mailcow", "aliases", accountId],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete alias");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Email Aliases</h3>
        <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Alias
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Alias</DialogTitle>
              <DialogDescription>
                Forward emails from a new address to your mailbox or another
                email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="alias-address">
                  Alias Address
                </label>
                <Input
                  id="alias-address"
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="hello@yourdomain.com"
                  value={address}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="alias-goto">
                  Forward To
                </label>
                <Input
                  id="alias-goto"
                  onChange={(e) => setGoto(e.target.value)}
                  placeholder="your@email.com"
                  value={goto}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="alias-comment">
                  Public Comment (Optional)
                </label>
                <Input
                  id="alias-comment"
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Work alias, newsletter, etc."
                  value={comment}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={!(address && goto) || isCreating}
                onClick={handleCreate}
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Alias
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {aliases.length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed py-4 text-center text-sm">
              No aliases created yet.
            </p>
          ) : (
            aliases.map((alias) => (
              <div
                className="hover:bg-accent/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                key={alias.id}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Mail className="text-primary h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{alias.address}</p>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Globe className="h-3 w-3" />
                      <span>{alias.goto}</span>
                    </div>
                    {alias.public_comment && (
                      <p className="text-muted-foreground mt-1 text-xs italic">
                        &quot;{alias.public_comment}&quot;
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alias.active === 1 ? (
                    <Badge
                      className="border-green-500/20 bg-green-500/10 text-green-600"
                      variant="secondary"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                  <Button
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(alias.id)}
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
