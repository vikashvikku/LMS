import { formatDate } from "@/lib/utils";
import { getFacultyDashboardData } from "@/lib/data/faculty";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, FileText, Clock, AlertCircle, Bell, MapPin, CheckCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FacultyDashboard() {
  const { profile, stats, upcomingDeadlines, todayClasses, announcements } = await getFacultyDashboardData();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome, {profile.first_name}
        </h1>
        <p className="text-muted-foreground mt-1">Here is your teaching overview for today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-all duration-200 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Sections</CardTitle>
            <div className="p-2 bg-primary/10 rounded-md">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.assignedSections}</div>
            <p className="text-xs text-muted-foreground mt-1">Active course sections</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <div className="p-2 bg-info/10 rounded-md">
              <Users className="h-4 w-4 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled across all sections</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Assignments</CardTitle>
            <div className="p-2 bg-success/10 rounded-md">
              <FileText className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently assigned tasks</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Submissions</CardTitle>
            <div className="p-2 bg-warning/10 rounded-md">
              <AlertCircle className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting grading & review</p>
          </CardContent>
        </Card>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Classes */}
        <Card className="lg:col-span-1 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Today&apos;s Classes
            </CardTitle>
            <CardDescription>Your scheduled classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            {todayClasses.length > 0 ? (
              <div className="space-y-4">
                {todayClasses.map((entry) => {
                  const course = entry.sections?.subjects?.courses;
                  const startTime = entry.start_time.substring(0, 5);
                  const endTime = entry.end_time.substring(0, 5);

                  return (
                    <div key={entry.id} className="flex flex-col gap-2 rounded-lg border bg-card p-4 transition-all hover:border-primary/30 hover:bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{course?.code}</span>
                        <Badge variant="outline" className="text-xs bg-muted font-medium text-muted-foreground">
                          {startTime} – {endTime}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{course?.title}</p>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{entry.rooms?.name || "TBA"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-success/10 p-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <p className="font-medium text-foreground">No classes today</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">Your schedule is clear for the rest of the day.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="lg:col-span-1 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-warning" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Assignments with approaching due dates</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex flex-col gap-2 rounded-lg border p-4 transition-all hover:bg-muted/30">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-medium text-foreground leading-tight">{deadline.title}</p>
                      <Badge variant="outline" className="text-xs whitespace-nowrap bg-warning/10 text-warning border-warning/20">
                        {formatDate(deadline.due_date)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {deadline.course_code} · {deadline.section_name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No upcoming deadlines</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">Students are all caught up on assignments.</p>
              </div>
            )}
            <Button variant="outline" asChild className="w-full mt-6">
              <Link href="/faculty/assignments">Manage Assignments</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="lg:col-span-1 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-info" />
              Recent Announcements
            </CardTitle>
            <CardDescription>University-wide notices</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((a) => (
                  <div key={a.id} className="group flex flex-col gap-1.5 rounded-lg border border-transparent p-3 hover:bg-muted/50 transition-colors">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{a.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{a.content}</p>
                    <p className="text-xs font-medium text-muted-foreground/70 mt-1">
                      {formatDate(a.created_at)}
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
                <p className="text-sm text-muted-foreground mt-1">You are up to date.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
