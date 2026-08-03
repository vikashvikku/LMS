import { getCoursesStatistics, getAdminCourses, getAdminPrograms } from "@/lib/data/admin";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle, XCircle, Users, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClientCourseGrid } from "./ClientCourseGrid";

export const metadata = {
  title: "Courses Management | Admin Portal",
};

export default async function AdminCoursesPage({ searchParams }) {
  const profile = await requireRole(["university_admin", "super_admin"]);

  // Wait for searchParams
  const awaitedSearchParams = await searchParams;
  
  const page = parseInt(awaitedSearchParams.page || "1", 10);
  const search = awaitedSearchParams.search || "";
  const programId = awaitedSearchParams.programId || "";
  const semester = awaitedSearchParams.semester || "";
  const status = awaitedSearchParams.status || "";
  const type = awaitedSearchParams.type || "";
  const sort = awaitedSearchParams.sort || "newest";

  const [stats, coursesData, allProgramsData] = await Promise.all([
    getCoursesStatistics(profile),
    getAdminCourses({ page, pageSize: 20, search, programId, semester, status, type, sort }),
    getAdminPrograms({ pageSize: 100 }) // Fetch programs for the filter dropdown
  ]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Courses Management</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage university courses, academic programs, faculty assignments, credits, and course availability.
          </p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link href="/admin/courses/new">
            <Plus className="h-4 w-4" />
            Add Course
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-primary opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Courses</CardTitle>
            <XCircle className="h-4 w-4 text-red-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Faculty</CardTitle>
            <Users className="h-4 w-4 text-amber-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.assignedFaculty}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <ClientCourseGrid 
        initialData={coursesData} 
        programs={allProgramsData.records || []}
        currentSearch={search} 
        currentProgram={programId}
        currentSemester={semester}
        currentStatus={status} 
        currentType={type}
        currentSort={sort} 
      />
    </div>
  );
}
