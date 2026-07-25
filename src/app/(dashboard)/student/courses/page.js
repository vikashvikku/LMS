import { getStudentCourses } from "@/lib/data/student";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, User, Calendar } from "lucide-react";
import Link from "next/link";

export default async function StudentCourses() {
  const enrollments = await getStudentCourses();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Courses</h1>
        <p className="text-muted-foreground">View and manage your current academic enrollments.</p>
      </div>

      {enrollments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-200 mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Courses Found</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            You are not currently enrolled in any courses for this academic term.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const section = enrollment.sections;
            const subject = section?.subjects;
            const course = subject?.courses;
            const faculty = section?.faculty_assignments?.find(fa => fa.is_primary)?.profiles;

            return (
              <Card key={enrollment.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-muted/50">
                      {subject?.code || 'N/A'}
                    </Badge>
                    <Badge variant={enrollment.status === 'active' ? "default" : "secondary"}>
                      {enrollment.status}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{subject?.title || 'Untitled Subject'}</CardTitle>
                  <CardDescription>{course?.title} • Section: {section?.name}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>
                      {faculty ? `${faculty.first_name} ${faculty.last_name}` : "TBA"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{section?.semesters?.name || "Current Term"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{course?.credits || 0} Credits</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/student/courses/${section?.id}`}>
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
