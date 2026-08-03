import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentManager } from "./DepartmentManager";

export const metadata = {
  title: "Departments | Settings",
};

export default async function DepartmentsPage() {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, code, description, is_active, profiles(first_name, last_name)")
    .eq("organization_id", profile.organization_id)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Department Management</h3>
        <p className="text-sm text-muted-foreground">
          Create and manage organizational departments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>
            Departments are used to group programs, courses, and faculty members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentManager departments={departments || []} />
        </CardContent>
      </Card>
    </div>
  );
}
