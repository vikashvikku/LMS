import { formatDate } from "@/lib/utils";
import { getStudentCourseDetails } from "@/lib/data/student";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CourseDetails({ params }) {
  const { courseId } = await params;
  const sectionId = courseId;
  const section = await getStudentCourseDetails(sectionId);

  if (!section) {
    notFound();
  }

  const subject = section.subjects;
  const course = subject?.courses;
  const facultyList = section.faculty_assignments?.map(fa => fa.profiles) || [];
  const assignments = section.assignments || [];
  const materials = section.course_materials || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="text-sm bg-muted/50">{subject?.code || 'N/A'}</Badge>
            <Badge className="text-sm">{section.semesters?.name || "Current Term"}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{subject?.title || 'Untitled Subject'}</h1>
          <p className="text-muted-foreground max-w-2xl">{course?.title} • Section: {section.name}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            {facultyList.length > 0 ? (
              <div className="flex flex-col gap-1">
                {facultyList.map((f, i) => (
                  <p key={i} className="text-sm font-medium">
                    {f.first_name} {f.last_name}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">TBA</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assignments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Assignments</CardTitle>
              <CardDescription>View all assignments for this course section.</CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map(assignment => (
                    <div key={assignment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-md">
                          <FileText className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {formatDate(assignment.due_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">
                          {assignment.max_marks} Marks
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/student/assignments/${assignment.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No assignments have been posted for this course.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
              <CardDescription>Resources and documents shared by faculty.</CardDescription>
            </CardHeader>
            <CardContent>
              {materials.length > 0 ? (
                <div className="space-y-4">
                  {materials.map(material => (
                    <div key={material.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-md">
                          <BookOpen className="h-5 w-5 text-foreground/90" />
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
                <div className="text-center py-8 text-muted-foreground">
                  No materials have been posted yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
