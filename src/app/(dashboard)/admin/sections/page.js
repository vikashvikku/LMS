import { getSectionsStatistics, getAdminSections, getAdminPrograms, getAdminCourses, getSemesters } from "@/lib/data/admin";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, CheckCircle, Users, AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClientSectionGrid } from "./ClientSectionGrid";

export const metadata = {
  title: "Sections Management | Admin Portal",
};

export default async function AdminSectionsPage({ searchParams }) {
  const profile = await requireRole(["university_admin", "super_admin"]);

  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page || "1", 10);
  const search = awaitedSearchParams.search || "";
  const programId = awaitedSearchParams.programId || "";
  const courseId = awaitedSearchParams.courseId || "";
  const semesterId = awaitedSearchParams.semesterId || "";
  const status = awaitedSearchParams.status || "";
  const sort = awaitedSearchParams.sort || "newest";

  const [stats, sectionsData, allPrograms, allCourses, allSemesters] = await Promise.all([
    getSectionsStatistics(profile),
    getAdminSections({ page, pageSize: 20, search, programId, courseId, semesterId, status, sort }),
    getAdminPrograms({ pageSize: 500 }),
    getAdminCourses({ pageSize: 1000 }),
    getSemesters()
  ]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Sections Management</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage class sections, academic assignments, students, and section capacity.
          </p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link href="/admin/sections/new">
            <Plus className="h-4 w-4" />
            Add Section
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sections</CardTitle>
            <Building className="h-4 w-4 text-primary opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sections</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students Assigned</CardTitle>
            <Users className="h-4 w-4 text-blue-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.students}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sections At Capacity</CardTitle>
            <AlertTriangle className={`h-4 w-4 opacity-80 ${stats.atCapacity > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.atCapacity}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <ClientSectionGrid 
        initialData={sectionsData} 
        programs={allPrograms.records || []}
        courses={allCourses.records || []}
        semesters={allSemesters || []}
        currentSearch={search} 
        currentProgram={programId}
        currentCourse={courseId}
        currentSemester={semesterId}
        currentStatus={status} 
        currentSort={sort} 
      />
    </div>
  );
}
