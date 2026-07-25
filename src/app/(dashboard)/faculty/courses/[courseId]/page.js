import { formatDate } from "@/lib/utils";
import { getFacultyCourseById } from "@/lib/data/faculty";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, BookOpen, Download, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FacultyCourseDetail({ params }) {
  const { courseId } = await params;
  const sectionId = courseId;
  const section = await getFacultyCourseById(sectionId);

  if (!section) {
    notFound();
  }

  const course = section.subjects?.courses;
  const subject = section.subjects;
  const semester = section.semesters;
  const academicYear = semester?.academic_years;
  const enrollments = section.student_enrollments || [];
  const activeStudents = enrollments.filter(e => e.status === 'active');
  const assignments = section.assignments || [];
  const materials = section.course_materials || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link href="/faculty/courses" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to My Courses
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="text-sm bg-muted">{course?.code || 'N/A'}</Badge>
          <Badge className="text-sm">{semester?.name || "Current Term"}</Badge>
          {section.faculty_assignment?.is_primary ? (
            <Badge className="bg-blue-600">Primary Faculty</Badge>
          ) : (
            <Badge variant="secondary">Co-Faculty</Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
          {course?.title || 'Untitled Course'}
        </h1>
        <p className="text-muted-foreground">
          {subject?.title ? `${subject.title} · ` : ''}Section {section.name}
          {academicYear ? ` · ${academicYear.name}` : ''}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Section</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{section.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{course?.credits || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{activeStudents.length} / {section.capacity}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{assignments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[500px]">
          <TabsTrigger value="students">Students ({activeStudents.length})</TabsTrigger>
          <TabsTrigger value="assignments">Assignments ({assignments.length})</TabsTrigger>
          <TabsTrigger value="materials">Materials ({materials.length})</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>Students currently enrolled in this section.</CardDescription>
            </CardHeader>
            <CardContent>
              {activeStudents.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b">
                      <tr>
                        <th className="text-left font-medium text-muted-foreground p-3">#</th>
                        <th className="text-left font-medium text-muted-foreground p-3">Student Name</th>
                        <th className="text-left font-medium text-muted-foreground p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {activeStudents.map((enrollment, i) => {
                        const student = enrollment.profiles;
                        return (
                          <tr key={enrollment.id}>
                            <td className="p-3 text-muted-foreground">{i + 1}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-muted-foreground">
                                  {student?.first_name?.[0]}{student?.last_name?.[0]}
                                </div>
                                <span className="font-medium">
                                  {student?.first_name} {student?.last_name}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {enrollment.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                  <Users className="h-12 w-12 text-muted mx-auto mb-4" />
                  <p>No students are currently enrolled in this section.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Section Assignments</CardTitle>
              <CardDescription>Assignments created for this section.</CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment) => {
                    const dueDate = new Date(assignment.due_date);
                    const isPast = dueDate < new Date();
                    const submissionCount = assignment.submissions?.[0]?.count || 0;

                    return (
                      <div key={assignment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md ${assignment.is_published ? 'bg-primary/10' : 'bg-muted'}`}>
                            <FileText className={`h-5 w-5 ${assignment.is_published ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{assignment.title}</p>
                              {!assignment.is_published && (
                                <Badge variant="secondary" className="text-xs">Draft</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Due: {formatDate(dueDate)}
                              {isPast && <span className="text-red-500 ml-1">(Past due)</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="font-medium">{submissionCount} / {activeStudents.length}</p>
                            <p className="text-muted-foreground">Submissions</p>
                          </div>
                          <Badge variant="outline">{assignment.max_marks} marks</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                  <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
                  <p>No assignments have been created for this section yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
              <CardDescription>Resources shared with students in this section.</CardDescription>
            </CardHeader>
            <CardContent>
              {materials.length > 0 ? (
                <div className="space-y-4">
                  {materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-md">
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{material.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Posted: {formatDate(material.created_at)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={material.storage_path} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                  <BookOpen className="h-12 w-12 text-muted mx-auto mb-4" />
                  <p>No materials have been uploaded for this section yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
