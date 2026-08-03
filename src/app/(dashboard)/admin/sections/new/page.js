import { requireRole } from "@/lib/auth";
import { getAdminPrograms, getAdminCourses, getSemesters } from "@/lib/data/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClientAddSectionForm } from "./ClientAddSectionForm";

export const metadata = {
  title: "Add Section | Admin Portal",
};

export default async function AddSectionPage() {
  await requireRole(["university_admin", "super_admin"]);

  const [{ records: programs }, { records: courses }, semesters] = await Promise.all([
    getAdminPrograms({ pageSize: 500 }),
    getAdminCourses({ pageSize: 1000 }),
    getSemesters()
  ]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/sections" 
          className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Section</h1>
          <p className="text-muted-foreground mt-1">Create a new class section for an academic subject.</p>
        </div>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Section Details</CardTitle>
          <CardDescription>Configure the academic properties and capacity of the section.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ClientAddSectionForm 
            programs={programs || []} 
            courses={courses || []} 
            semesters={semesters || []} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
