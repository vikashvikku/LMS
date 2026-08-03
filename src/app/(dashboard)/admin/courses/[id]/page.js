import { getAdminCourseById, getAdminPrograms } from "@/lib/data/admin";
import { requireRole } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Layers, BookOpen, Clock, Users, UserCheck } from "lucide-react";
import Link from "next/link";
import { ClientEditCourseDialog } from "./ClientEditCourseDialog";
import { ClientCourseActivationToggle } from "./ClientCourseActivationToggle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Course Details | Admin Portal",
};

export default async function AdminCourseDetailsPage(props) {
  const { id: courseId } = await props.params;
  const course = await getAdminCourseById(courseId);

  if (!course) {
    notFound();
  }

  await requireRole(["university_admin", "super_admin"]);

  // Fetch programs for the edit dialog
  const { records: programs } = await getAdminPrograms({ pageSize: 500 });

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/admin/courses" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Courses
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {course.title}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="font-mono text-sm">{course.code}</Badge>
              <Badge variant={course.is_active ? "outline" : "secondary"} className={!course.is_active ? "bg-red-100 text-red-800 border-transparent" : "bg-emerald-50 text-emerald-700 border-emerald-200"}>
                {course.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Layers className="h-4 w-4" />
                {course.program?.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClientEditCourseDialog course={course} programs={programs || []} />
            <ClientCourseActivationToggle 
              courseId={course.id} 
              isActive={course.is_active} 
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left Column: Details & Stats */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                Course Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Course Type</p>
                <p className="font-medium text-foreground">{course.type || 'Core'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Semester</p>
                <p className="font-medium text-foreground">Semester {course.semester || 1}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">Credits</p>
                <p className="font-medium text-foreground">{course.credits || 3}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Created On</p>
                <p className="font-medium text-foreground">{new Date(course.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><UserCheck className="h-4 w-4" /> Assigned Faculty</span>
                <span className="font-bold">{course.stats.facultyCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Layers className="h-4 w-4" /> Sections</span>
                <span className="font-bold">{course.stats.sectionsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Students Enrolled</span>
                <span className="font-bold">{course.stats.studentsCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Faculty and Sections */}
        <div className="md:col-span-3 space-y-6">
          {/* Assigned Faculty Section */}
          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                    Teaching Faculty
                  </CardTitle>
                  <CardDescription>Faculty members currently assigned to teach this course.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {course.faculty.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>NAME</TableHead>
                        <TableHead>DESIGNATION</TableHead>
                        <TableHead className="text-right">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.faculty.map(fac => (
                        <TableRow key={fac.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {fac.avatar_url ? (
                                <img src={fac.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                  {fac.first_name[0]}{fac.last_name[0]}
                                </div>
                              )}
                              <span>{fac.first_name} {fac.last_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{fac.faculty_profiles?.[0]?.designation || 'Faculty'}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm" className="h-8 text-blue-600">
                              <Link href={`/admin/faculty/${fac.id}`}>Profile</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <UserCheck className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium text-foreground">No faculty has been assigned to this course.</p>
                  <p className="text-sm mt-1">Assign faculty through the Faculty Management module.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Sections Section */}
          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="h-5 w-5 text-muted-foreground" />
                    Related Sections
                  </CardTitle>
                  <CardDescription>Academic sections hosting this course.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {course.sections.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>SECTION NAME</TableHead>
                        <TableHead className="text-center">ACTIVE ENROLLMENTS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.sections.map(sec => {
                        const activeCount = sec.student_enrollments?.filter(e => e.status === 'active').length || 0;
                        return (
                          <TableRow key={sec.id}>
                            <TableCell className="font-medium">{sec.name}</TableCell>
                            <TableCell className="text-center">{activeCount}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <Layers className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium text-foreground">No sections created for this course yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
