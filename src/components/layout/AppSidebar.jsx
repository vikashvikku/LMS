"use client";

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
  const navigation = roleNavigation[role] || [
    { name: "Dashboard", href: `/${role}/dashboard`, icon: Home },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">CampusOS</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid items-start px-3 text-sm font-medium gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            
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
                className={cn(
                  "relative group flex items-center gap-3 rounded-md px-3 py-2.5 text-sidebar-foreground/70 transition-all duration-200 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  isActive && "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-primary rounded-r-md" />
                )}
                <item.icon className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                )} />
                {item.name}
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
