import { getFacultyGradebook } from "@/lib/data/faculty";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, FileText, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function FacultyGradebookOverview() {
  const gradebook = await getFacultyGradebook();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gradebook</h1>
        <p className="text-muted-foreground">Manage and review student grades for your assigned sections.</p>
      </div>

      {gradebook.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <Award className="h-12 w-12 text-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Courses Assigned</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            You do not have any assigned courses to manage grades for.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gradebook.map((fa) => {
            const section = fa.sections;
            const course = section?.subjects?.courses;
            const enrolledCount = section?.student_enrollments?.[0]?.count || 0;
            const assignments = section?.assignments || [];
            
            // Calculate real stats
            const totalAssignments = assignments.length;
            let totalSubmissions = 0;
            let gradedSubmissions = 0;
            
            assignments.forEach(a => {
              const subs = a.submissions || [];
              totalSubmissions += subs.length;
              gradedSubmissions += subs.filter(s => s.grades && s.grades.length > 0).length;
            });
            
            const pendingGrading = totalSubmissions - gradedSubmissions;

            return (
              <Card key={fa.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-muted">
                      {course?.code || 'N/A'}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course?.title || 'Untitled Course'}</CardTitle>
                  <CardDescription>
                    Section {section?.name} · {enrolledCount} Students
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted p-2 rounded border flex flex-col">
                      <span className="text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3"/> Assignments</span>
                      <span className="font-semibold text-foreground mt-1">{totalAssignments}</span>
                    </div>
                    <div className="bg-muted p-2 rounded border flex flex-col">
                      <span className="text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3"/> Graded</span>
                      <span className="font-semibold text-foreground mt-1">{gradedSubmissions}</span>
                    </div>
                  </div>
                  
                  {pendingGrading > 0 && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{pendingGrading} submissions pending review</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/faculty/grades/${section?.id}`}>
                      Open Gradebook
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
