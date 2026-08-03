"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  GraduationCap,
  Home,
  Bell,
  Library,
  User,
  Award,
  Users,
  Layers,
  Building,
  Settings,
  Activity,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const roleNavigation = {
  student: [
    { name: "Dashboard", href: "/student/dashboard", icon: Home },
    { name: "My Courses", href: "/student/courses", icon: BookOpen },
    { name: "Timetable", href: "/student/timetable", icon: Calendar },
    { name: "Attendance", href: "/student/attendance", icon: CheckCircle },
    { name: "Assignments", href: "/student/assignments", icon: FileText },
    { name: "Grades", href: "/student/grades", icon: GraduationCap },
    { name: "Fees", href: "/student/fees", icon: CreditCard },
    { name: "Library", href: "/student/library", icon: Library },
    { name: "Announcements", href: "/student/announcements", icon: Bell },
    { name: "Notifications", href: "/student/notifications", icon: Bell },
  ],
  faculty: [
    { name: "Dashboard", href: "/faculty/dashboard", icon: Home },
    { name: "My Courses", href: "/faculty/courses", icon: BookOpen },
    { name: "Attendance", href: "/faculty/attendance", icon: CheckCircle },
    { name: "Assignments", href: "/faculty/assignments", icon: FileText },
    { name: "Grades", href: "/faculty/grades", icon: Award },
  ],
  university_admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Faculty", href: "/admin/faculty", icon: GraduationCap },
    { name: "Programs", href: "/admin/programs", icon: Layers },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Sections", href: "/admin/sections", icon: Building },
    { name: "Timetable", href: "/admin/timetable", icon: Calendar },
    { name: "Fees", href: "/admin/fees", icon: CreditCard },
    { name: "Announcements", href: "/admin/announcements", icon: Bell },
    { name: "Audit / Activity", href: "/admin/audit", icon: Activity },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export function AppSidebar({ role }) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [pendingHref, setPendingHref] = useState(null);

  // Clear pending state when path changes
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setPendingHref(null);
  }

  const navigation = roleNavigation[role] || [
    { name: "Dashboard", href: `/${role}/dashboard`, icon: Home },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r bg-sidebar md:flex select-none">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-3 transition-transform duration-150 active:scale-95 hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/20 shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">CampusOS</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid items-start px-3 text-sm font-medium gap-1">
          {navigation.map((item) => {
            const isCurrentlyActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
            const isPending = pendingHref === item.href;
            const isHighlighted = isCurrentlyActive || isPending;
            
            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="relative group flex items-center gap-3 rounded-md px-3 py-2.5 text-sidebar-foreground/40 cursor-not-allowed"
                >
                  <item.icon className="h-4 w-4 text-sidebar-foreground/30" />
                  {item.name}
                  <span className="ml-auto text-[10px] uppercase tracking-wider bg-sidebar-accent/50 px-1.5 py-0.5 rounded text-sidebar-foreground/50">Soon</span>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                onClick={() => {
                  if (pathname !== item.href) {
                    setPendingHref(item.href);
                  }
                }}
                className={cn(
                  "relative group flex items-center gap-3 rounded-md px-3 py-2.5 text-sidebar-foreground/70 transition-all duration-150 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-foreground active:scale-[0.98]",
                  isHighlighted && "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary shadow-xs"
                )}
              >
                {isHighlighted && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-primary rounded-r-md transition-all duration-200" />
                )}
                <item.icon className={cn(
                  "h-4 w-4 transition-colors duration-200 shrink-0",
                  isHighlighted ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                )} />
                <span className="truncate">{item.name}</span>

                {isPending && !isCurrentlyActive && (
                  <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t mt-auto">
        <div className="rounded-lg bg-sidebar-accent/50 border border-border-subtle p-4 text-xs">
          <p className="font-semibold text-sidebar-foreground mb-1">
            CampusOS {role === 'faculty' ? 'Faculty' : role === 'university_admin' ? 'Admin' : 'Student'} Portal
          </p>
          <p className="text-sidebar-foreground/60">Version 2.0</p>
        </div>
      </div>
    </aside>
  );
}

