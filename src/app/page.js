import { Button } from "@/components/ui/button";
import { getCurrentProfile, getDashboardPathForRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const profile = await getCurrentProfile();
  
  if (profile) {
    redirect(getDashboardPathForRole(profile.role));
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center sm:p-20 font-[family-name:var(--font-geist-sans)] bg-slate-50">
      <main className="flex flex-col gap-8 items-center max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
          CampusOS
        </h1>
        <p className="text-lg text-slate-600">
          An Enterprise University Operating System connecting students, faculty, and administration.
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row mt-4">
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Student Registration</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
