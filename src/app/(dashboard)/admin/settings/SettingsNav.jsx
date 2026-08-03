"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  GraduationCap, 
  Users, 
  Bell, 
  Palette,
  Network
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

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
