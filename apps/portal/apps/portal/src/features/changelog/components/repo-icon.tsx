import { cn } from "@portal/utils/utils";
import {
  Bot,
  Disc,
  FileText,
  GitFork,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Network,
  ScrollText,
  Server,
  Terminal,
  Wrench,
} from "lucide-react";

/**
 * Map of repo identifiers to their unique icons.
 * Add new repos here as they're added to CHANGELOG_REPOS.
 */
const REPO_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "allthingslinux/allthingslinux": Globe,
  "allthingslinux/atl-wiki": ScrollText,
  "allthingslinux/atl.chat": MessageCircle,
  "allthingslinux/atl.network": Network,
  "allthingslinux/atl.services": Server,
  "allthingslinux/atl.tools": Wrench,
  "allthingslinux/code-of-conduct": FileText,
  "allthingslinux/iso.atl.dev": Disc,
  "allthingslinux/portal": LayoutDashboard,
  "allthingslinux/pubnix": Terminal,
  "allthingslinux/tux": Bot,
};

interface RepoIconProps {
  className?: string;
  repoId: string;
}

/**
 * Renders a unique icon per repository. Falls back to a generic fork icon
 * for repos not explicitly mapped.
 */
export function RepoIcon({ repoId, className }: RepoIconProps) {
  const Icon = REPO_ICONS[repoId] ?? GitFork;
  return <Icon className={cn("size-3.5 text-muted-foreground", className)} />;
}