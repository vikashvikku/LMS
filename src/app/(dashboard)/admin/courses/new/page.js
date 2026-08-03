import { requireRole } from "@/lib/auth";
import { getAdminPrograms } from "@/lib/data/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClientAddCourseForm } from "./ClientAddCourseForm";

export const metadata = {
  title: "Add Course | Admin Portal",
};

export default async function AddCoursePage() {
  await requireRole(["university_admin", "super_admin"]);

  const { records: programs } = await getAdminPrograms({ pageSize: 500 });

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/courses" 
          className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Course</h1>
          <p className="text-muted-foreground mt-1">Create a new academic course.</p>
        </div>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Enter the primary information for the academic course.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ClientAddCourseForm programs={programs || []} />
        </CardContent>
      </Card>
    </div>
  );
}
