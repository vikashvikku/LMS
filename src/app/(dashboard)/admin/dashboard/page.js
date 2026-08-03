import { getAdminDashboardData } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/utils";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Calendar,
  Building,
  Bell,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard | Admin Portal",
};

export default async function AdminDashboard() {
  const { 
    profile, 
    organization, 
    stats, 
    activeAcademicYear, 
    recentAnnouncements 
  } = await getAdminDashboardData();

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      description: "Active student accounts",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Total Faculty",
      value: stats.totalFaculty,
      icon: GraduationCap,
      description: "Active faculty members",
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/20"
    },
    {
      title: "Programs",
      value: stats.totalPrograms,
      icon: Layers,
      description: "Academic programs",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20"
    },
    {
      title: "Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      description: "Unique course offerings",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
      title: "Sections",
      value: stats.totalSections,
      icon: Building,
      description: "Active class sections",
      color: "text-rose-600",
      bgColor: "bg-rose-100 dark:bg-rose-900/20"
    }
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          University Administration
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {organization?.name || "Your Institution"} &mdash; Overview of your institution&apos;s academic operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        {/* Academic Period */}
        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Active Academic Period
            </CardTitle>
            <CardDescription>Currently active term for the organization.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {activeAcademicYear ? (
              <div className="space-y-6">
                <div className="text-center p-6 border rounded-lg bg-card shadow-sm">
                  <h3 className="text-2xl font-bold text-foreground">{activeAcademicYear.name}</h3>
                  <div className="mt-2 flex justify-center items-center gap-2 text-sm text-muted-foreground">
                    <span>{new Date(activeAcademicYear.start_date).toLocaleDateString()}</span>
                    <span>&mdash;</span>
                    <span>{new Date(activeAcademicYear.end_date).toLocaleDateString()}</span>
                  </div>
                  <Badge className="mt-4 bg-green-600 hover:bg-green-700 text-white">Active Year</Badge>
                </div>
                
                {activeAcademicYear.semesters && activeAcademicYear.semesters.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-3 border-b pb-2">Semesters</h4>
                    <div className="space-y-2">
                      {activeAcademicYear.semesters.map((sem) => {
                        const now = new Date();
                        const sStart = new Date(sem.start_date);
                        const sEnd = new Date(sem.end_date);
                        const isCurrent = now >= sStart && now <= sEnd;
                        
                        return (
                          <div key={sem.id} className="flex items-center justify-between p-3 border rounded-md">
                            <span className="font-medium text-sm text-foreground">{sem.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">
                                {sStart.toLocaleDateString()} - {sEnd.toLocaleDateString()}
                              </span>
                              {isCurrent && <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">Current</Badge>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed rounded-lg bg-muted/50">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground font-medium">No active academic year configured.</p>
                <p className="text-xs text-muted-foreground mt-1">Please set up an academic year in Settings.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              Recent Announcements
            </CardTitle>
            <CardDescription>Latest system-wide broadcasts.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {recentAnnouncements && recentAnnouncements.length > 0 ? (
              <div className="space-y-4">
                {recentAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="font-semibold text-foreground leading-tight">
                        {announcement.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded">
                        {formatDateTime(new Date(announcement.created_at))}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {announcement.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        {announcement.author?.first_name} {announcement.author?.last_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg bg-muted/50">
                <Bell className="h-8 w-8 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground font-medium">No recent announcements.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Omitted: 
          As per prompt instructions, no generic recent activity source exists yet, 
          so the section is omitted in Phase 1 to prevent mock data. */}
    </div>
  );
}
