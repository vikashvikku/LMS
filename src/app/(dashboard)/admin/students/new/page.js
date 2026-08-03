import { AddStudentForm } from "./AddStudentForm";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Add Student | Admin Portal",
};

export default async function AdminAddStudentPage() {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  // Fetch programs and their active sections for the dropdowns
  const { data: programs } = await supabase
    .from('programs')
    .select(`
      id, name, code,
      departments!inner(organization_id),
      courses (
        title, code,
        subjects (
          code,
          sections (
            id, name, capacity,
            semesters!inner(academic_years!inner(is_active))
          )
        )
      )
    `)
    .eq('departments.organization_id', profile.organization_id)
    .eq('courses.subjects.sections.semesters.academic_years.is_active', true);

  // Clean up the data shape for the client component
  // We filter out any sections that didn't match the active year criteria (Supabase returns them as null or empty arrays if they don't match the !inner join condition)
  const cleanPrograms = (programs || []).map(p => {
    return {
      id: p.id,
      name: p.name,
      code: p.code,
      courses: p.courses?.map(c => ({
        title: c.title,
        code: c.code,
        subjects: c.subjects?.map(s => ({
          code: s.code,
          sections: s.sections?.filter(sec => sec.semesters) // keep only those with active semesters
        })).filter(s => s.sections && s.sections.length > 0)
      })).filter(c => c.subjects && c.subjects.length > 0)
    };
  }).filter(p => p.courses && p.courses.length > 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div>
        <Link href="/admin/students" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Students
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Add Student
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Create a new student account and issue an invitation.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <AddStudentForm programsWithSections={cleanPrograms} />
      </div>
    </div>
  );
}
