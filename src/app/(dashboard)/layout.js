import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { requireProfile } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const profile = await requireProfile();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
      <AppSidebar role={profile.role} />
      <div className="flex flex-col">
        <AppHeader profile={profile} />
        <main className="flex-1 p-4 md:p-8 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
