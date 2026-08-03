import { getTimetableStatistics, getAdminTimetableEntries, getAdminPrograms, getAdminCourses, getAdminSections, getRooms, getAdminFaculty } from "@/lib/data/admin";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Users, AlertTriangle, CalendarDays, Clock, UserCheck } from "lucide-react";
import { ClientTimetableView } from "./ClientTimetableView";

export const metadata = {
  title: "Timetable Management | Admin Portal",
};

export default async function AdminTimetablePage({ searchParams }) {
  const profile = await requireRole(["university_admin", "super_admin"]);

  const awaitedSearchParams = await searchParams;
  const search = awaitedSearchParams.search || "";
  const programId = awaitedSearchParams.programId || "";
  const courseId = awaitedSearchParams.courseId || "";
  const sectionId = awaitedSearchParams.sectionId || "";
  const facultyId = awaitedSearchParams.facultyId || "";
  const day = awaitedSearchParams.day || "";

  const [
    stats, 
    timetableData, 
    allPrograms, 
    allCourses, 
    allSections,
    allRooms,
    facultyResult
  ] = await Promise.all([
    getTimetableStatistics(profile),
    getAdminTimetableEntries({ search, programId, courseId, sectionId, facultyId, day }),
    getAdminPrograms({ pageSize: 500 }),
    getAdminCourses({ pageSize: 1000 }),
    getAdminSections({ pageSize: 2000 }),
    getRooms(),
    getAdminFaculty({ pageSize: 2000, status: 'active' })
  ]);

  const allFaculty = facultyResult?.records || [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Timetable Management</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Manage class schedules, faculty assignments, rooms, and academic time slots.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
            <Calendar className="h-4 w-4 text-primary opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalClasses}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Classes Today</CardTitle>
            <Clock className="h-4 w-4 text-blue-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.classesToday}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Faculty</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.assignedFaculty}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduling Conflicts</CardTitle>
            <AlertTriangle className={`h-4 w-4 opacity-80 ${stats.schedulingConflicts > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.schedulingConflicts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <ClientTimetableView 
        initialData={timetableData} 
        programs={allPrograms.records || []}
        courses={allCourses.records || []}
        sections={allSections.records || []}
        rooms={allRooms || []}
        currentSearch={search} 
        currentProgram={programId}
        currentCourse={courseId}
        currentSection={sectionId}
        currentDay={day}
        allFaculty={allFaculty}
      />
    </div>
  );
}
