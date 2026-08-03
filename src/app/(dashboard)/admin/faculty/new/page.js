import { AddFacultyForm } from "./AddFacultyForm";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UserPlus, GraduationCap } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Add Faculty | Admin Portal",
};

export default async function AdminAddFacultyPage() {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  // Fetch departments for the dropdown
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name, code')
    .eq('organization_id', profile.organization_id)
    .order('name');

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div>
        <Link href="/admin/faculty" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Faculty
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Add Faculty
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Create a new faculty account and issue an invitation.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <AddFacultyForm departments={departments || []} />
      </div>
    </div>
  );
}
