import { formatDate } from "@/lib/utils";
import { getFacultyAttendanceOverview } from "@/lib/data/faculty";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function FacultyAttendanceOverview() {
  const assignments = await getFacultyAttendanceOverview();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance</h1>
        <p className="text-muted-foreground">Manage attendance for your assigned sections.</p>
      </div>

      {assignments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="h-12 w-12 text-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Courses Assigned</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            You do not have any assigned courses to manage attendance for.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((fa) => {
            const section = fa.sections;
            const course = section?.subjects?.courses;
            const enrolledCount = section?.student_enrollments?.[0]?.count || 0;
            const sessions = section?.attendance_sessions || [];
            
            // Sort sessions to find the latest
            const sortedSessions = [...sessions].sort((a, b) => new Date(b.session_date) - new Date(a.session_date));
            const latestSession = sortedSessions[0];

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
                    Section {section?.name} · {section?.semesters?.name || "Current Term"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{enrolledCount} Students</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md border text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Total Sessions</span>
                      <span className="font-medium text-foreground">{sessions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latest Session</span>
                      <span className="font-medium text-foreground">
                        {latestSession ? formatDate(latestSession.session_date) : 'None'}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/faculty/attendance/${section?.id}`}>
                      View Attendance
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
