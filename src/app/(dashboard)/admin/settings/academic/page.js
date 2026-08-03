import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AcademicYearManager } from "./AcademicYearManager";
import { SemesterManager } from "./SemesterManager";

export const metadata = {
  title: "Academic Settings | Settings",
};

export default async function AcademicSettingsPage() {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  const { data: academicYears } = await supabase
    .from("academic_years")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("start_date", { ascending: false });

  const { data: semesters } = await supabase
    .from("semesters")
    .select("*, academic_years!inner(organization_id)")
    .eq("academic_years.organization_id", profile.organization_id)
    .order("start_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Academic Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage academic years and semesters for your institution.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Academic Years</CardTitle>
            <CardDescription>
              Define the academic calendar years. Only one year can be active at a time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AcademicYearManager academicYears={academicYears || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semesters / Terms</CardTitle>
            <CardDescription>
              Define semesters or terms within your academic years. Only one semester can be active at a time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SemesterManager 
              semesters={semesters || []} 
              academicYears={academicYears || []} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
