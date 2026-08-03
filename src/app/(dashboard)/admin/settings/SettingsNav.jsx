"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  GraduationCap, 
  Users, 
  Bell, 
  Palette,
  Network,
  Loader2
} from "lucide-react";

const items = [
  {
    title: "Organization Profile",
    href: "/admin/settings/organization",
    icon: Building2
  },
  {
    title: "Academic Settings",
    href: "/admin/settings/academic",
    icon: GraduationCap
  },
  {
    title: "Departments",
    href: "/admin/settings/departments",
    icon: Network
  },
  {
    title: "User Management",
    href: "/admin/settings/users",
    icon: Users
  },
  {
    title: "Notifications",
    href: "/admin/settings/notifications",
    icon: Bell
  },
  {
    title: "Branding",
    href: "/admin/settings/branding",
    icon: Palette
  }
];

export function SettingsNav() {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [pendingHref, setPendingHref] = useState(null);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setPendingHref(null);
  }

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0 select-none">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const isPending = pendingHref === item.href;
        const isHighlighted = isActive || isPending;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            onClick={() => {
              if (pathname !== item.href) {
                setPendingHref(item.href);
              }
            }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] whitespace-nowrap",
              isHighlighted
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-4 w-4 shrink-0", isHighlighted ? "text-primary" : "opacity-70")} />
            <span className="truncate">{item.title}</span>
            {isPending && !isActive && (
              <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-primary shrink-0" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

