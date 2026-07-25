"use client";

import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "./AppSidebar";
import { UserMenu } from "./UserMenu";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearch } from "./GlobalSearch";

export function AppHeader({ profile }) {
  return (
    <header className="flex h-16 items-center gap-4 bg-[#302721] text-[#FBF7F0] dark:bg-background/95 dark:text-foreground backdrop-blur supports-[backdrop-filter]:dark:bg-background/60 px-6 z-10 sticky top-0 border-b-0 dark:border-transparent">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden hover:bg-white/10 dark:hover:bg-accent">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-64 border-r-0">
          <AppSidebar role={profile.role} />
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1 flex justify-start">
        <GlobalSearch role={profile.role} />
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {profile.role === "student" && (
          <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-white/10 dark:hover:bg-primary/10 hover:text-[#FBF7F0] dark:hover:text-primary transition-colors">
            <Link href={`/${profile.role}/notifications`}>
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Link>
          </Button>
        )}
        <div className="h-6 w-px bg-white/20 dark:bg-border mx-1 hidden sm:block"></div>
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
