"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { ProtectedRoute } from "@/features/routing/lib/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@atl/ui/components/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@atl/ui/components/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@atl/ui/components/sidebar";
import { cn } from "@atl/ui/lib/utils";

interface NavCollapsibleProps {
  route: ProtectedRoute;
}

export function NavCollapsible({ route }: NavCollapsibleProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const children = route.navigation?.children || [];

  const isActive = children.some(
    (child) => pathname === child.path || pathname.startsWith(`${child.path}/`)
  );
  const isRouteActive =
    pathname === route.path || pathname.startsWith(`${route.path}/`);
  const shouldBeOpen = isActive || isRouteActive;
  const [open, setOpen] = useState(shouldBeOpen);

  useEffect(() => {
    if (shouldBeOpen) {
      setOpen(true);
    }
  }, [shouldBeOpen]);

  const Icon = route.icon;

  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                isActive={isRouteActive || isActive}
                tooltip={route.label}
              />
            }
          >
            {Icon && <Icon />}
            <span>{route.label}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link
                    href={route.path as Parameters<typeof Link>[0]["href"]}
                  />
                }
              >
                {Icon && <Icon />}
                {route.label}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {children.map((child) => (
                <DropdownMenuItem
                  key={child.id}
                  render={
                    <Link
                      href={child.path as Parameters<typeof Link>[0]["href"]}
                    />
                  }
                >
                  {child.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      onOpenChange={setOpen}
      open={open}
      render={<SidebarMenuItem className="group/collapsible" />}
    >
      <div className="flex w-full items-center gap-2">
        <SidebarMenuButton
          isActive={isRouteActive || isActive}
          render={(props) => (
            <Link
              {...props}
              className={cn(props.className, "flex flex-1 items-center gap-2")}
              href={route.path as Parameters<typeof Link>[0]["href"]}
            >
              {Icon && <Icon />}
              <span>{route.label}</span>
            </Link>
          )}
          tooltip={route.label}
        />
        <CollapsibleTrigger
          render={(triggerProps) => (
            <button
              type="button"
              {...triggerProps}
              aria-label="Toggle submenu"
              className="hover:bg-sidebar-accent focus-visible:ring-sidebar-ring shrink-0 rounded-md p-1 outline-hidden focus-visible:ring-2"
            >
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </button>
          )}
        />
      </div>
      <CollapsibleContent>
        <SidebarMenuSub>
          {children.map((child) => (
            <SidebarMenuSubItem key={child.id}>
              <SidebarMenuSubButton
                render={(props) => (
                  <Link
                    {...props}
                    href={child.path as Parameters<typeof Link>[0]["href"]}
                  >
                    <span>{child.label}</span>
                  </Link>
                )}
              />
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
