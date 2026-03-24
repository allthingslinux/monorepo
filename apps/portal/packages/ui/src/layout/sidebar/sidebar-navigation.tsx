"use client";

import type {
  NavigationGroup,
  ProtectedRoute,
} from "@/features/routing/lib/types";
import { NavGroup } from "../navigation/nav-group";

interface SidebarNavigationProps {
  groups: (NavigationGroup & { items: ProtectedRoute[] })[];
}

export function SidebarNavigation({ groups }: SidebarNavigationProps) {
  return (
    <>
      {groups.map((group) => (
        <NavGroup group={group} key={group.id} />
      ))}
    </>
  );
}
