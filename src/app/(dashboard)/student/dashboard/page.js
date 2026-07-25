import { formatDate } from "@/lib/utils";
import { getStudentDashboardData } from "@/lib/data/student";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle, FileText, GraduationCap, Bell, Calendar, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function StudentDashboard() {
  const { profile, stats, upcomingAssignments, announcements } = await getStudentDashboardData();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Good day, {profile.first_name}
        </h1>
        <p className="text-muted-foreground mt-1">Here is your academic overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-all duration-200 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
            <div className="p-2 bg-primary/10 rounded-md">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.enrolledCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Current semester subjects</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-200 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Assignments</CardTitle>
            <div className="p-2 bg-warning/10 rounded-md">
              <FileText className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingAssignments}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting your submission</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle>
            <div className="p-2 bg-info/10 rounded-md">
              <CheckCircle className="h-4 w-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.attendancePercentage !== null ? `${stats.attendancePercentage}%` : '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall presence rate</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            <div className="p-2 bg-success/10 rounded-md">
              <Trophy className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.gpa !== null ? `${stats.gpa.toFixed(2)}%` : '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aggregate performance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-warning" />
              Upcoming Assignments
            </CardTitle>
            <CardDescription>Tasks due in the near future</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAssignments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex flex-col gap-2 rounded-lg border p-4 transition-all hover:bg-muted/30">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-medium text-foreground leading-tight">{assignment.title}</p>
                      <Badge variant="outline" className="text-xs whitespace-nowrap bg-warning/10 text-warning border-warning/20">
                        {formatDate(assignment.due_date)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {assignment.sections?.subjects?.code}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-success/10 p-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <p className="font-medium text-foreground">You&apos;re all caught up!</p>
                <p className="text-sm text-muted-foreground mt-1">No pending assignments at the moment.</p>
              </div>
            )}
            <Button variant="outline" asChild className="w-full mt-6">
              <Link href="/student/assignments">View All Assignments</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-info" />
              Recent Announcements
            </CardTitle>
            <CardDescription>Important updates from the university</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="group flex flex-col gap-1.5 rounded-lg border border-transparent p-3 hover:bg-muted/50 transition-colors">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{announcement.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{announcement.content}</p>
                    <p className="text-xs font-medium text-muted-foreground/70 mt-1">
                      {formatDate(announcement.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No recent announcements</p>
                <p className="text-sm text-muted-foreground mt-1">Check back later for updates.</p>
              </div>
            )}
            <Button variant="outline" asChild className="w-full mt-6">
              <Link href="/student/announcements">View All Announcements</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
