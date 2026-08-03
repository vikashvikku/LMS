import { Suspense } from "react";
import { getAdminAnnouncements, getAdminAnnouncementStatistics } from "@/actions/announcements";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle2, Clock, FileEdit } from "lucide-react";
import { ClientAnnouncementList } from "./ClientAnnouncementList";

export const metadata = {
  title: "Announcements Management | CampusOS",
};

export default async function AnnouncementsPage(props) {
  const searchParams = await props.searchParams;
  await requireRole(["university_admin", "super_admin"]);

  const [announcements, stats] = await Promise.all([
    getAdminAnnouncements({
      search: searchParams?.search || "",
      audience: searchParams?.audience || "all",
      status: searchParams?.status || "all",
    }),
    getAdminAnnouncementStatistics()
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Announcements Management</h1>
        <p className="text-muted-foreground mt-1">Create, publish, and manage announcements for students and faculty.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.published}</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.scheduled}</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileEdit className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-500">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Suspense fallback={<div className="h-96 flex items-center justify-center border rounded-lg bg-card text-muted-foreground">Loading announcements...</div>}>
        <ClientAnnouncementList initialData={announcements} />
      </Suspense>
    </div>
  );
}
