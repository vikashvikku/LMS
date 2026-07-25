import { getFacultyCourses } from "@/lib/data/faculty";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Calendar } from "lucide-react";
import Link from "next/link";

export default async function FacultyCourses() {
  const assignments = await getFacultyCourses();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Courses</h1>
        <p className="text-muted-foreground">Sections and courses assigned to you.</p>
      </div>

      {assignments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Courses Assigned</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            No courses have been assigned to you yet. Contact your department head if you believe this is an error.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((fa) => {
            const section = fa.sections;
            const course = section?.subjects?.courses;
            const subject = section?.subjects;
            const semester = section?.semesters;
            const academicYear = semester?.academic_years;
            const enrolledCount = section?.student_enrollments?.[0]?.count || 0;

            return (
              <Card key={fa.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-muted">
                      {course?.code || 'N/A'}
                    </Badge>
                    <Badge variant={fa.is_primary ? "default" : "secondary"}>
                      {fa.is_primary ? "Primary" : "Co-Faculty"}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course?.title || 'Untitled Course'}</CardTitle>
                  <CardDescription>
                    {subject?.title ? `${subject.title} · ` : ''}Section: {section?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{enrolledCount} Students Enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{semester?.name || "Current Term"}</span>
                  </div>
                  {academicYear && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{academicYear.name}</span>
                      {academicYear.is_active && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Active</Badge>
                      )}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {course?.credits || 0} Credits
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/faculty/courses/${section?.id}`}>
                      View Course
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
