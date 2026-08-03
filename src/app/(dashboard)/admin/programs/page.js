import { getProgramsStatistics, getAdminPrograms } from "@/lib/data/admin";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, GraduationCap, CheckCircle, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClientProgramGrid } from "./ClientProgramGrid";

export const metadata = {
  title: "Programs Management | Admin Portal",
};

export default async function AdminProgramsPage({ searchParams }) {
  const profile = await requireRole(["university_admin", "super_admin"]);

  // Wait for searchParams
  const awaitedSearchParams = await searchParams;
  
  const page = parseInt(awaitedSearchParams.page || "1", 10);
  const search = awaitedSearchParams.search || "";
  const status = awaitedSearchParams.status || "";
  const sort = awaitedSearchParams.sort || "newest";

  const [stats, programsData] = await Promise.all([
    getProgramsStatistics(profile),
    getAdminPrograms({ page, pageSize: 10, search, status, sort }),
  ]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Programs Management</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage academic programs, duration, departments, courses, and student enrollment.
          </p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link href="/admin/programs/new">
            <Plus className="h-4 w-4" />
            Add Program
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Programs</CardTitle>
            <Layers className="h-4 w-4 text-primary opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Programs</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.courses}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students Enrolled</CardTitle>
            <GraduationCap className="h-4 w-4 text-amber-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.students}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <ClientProgramGrid 
        initialData={programsData} 
        currentSearch={search} 
        currentStatus={status} 
        currentSort={sort} 
      />
    </div>
  );
}
