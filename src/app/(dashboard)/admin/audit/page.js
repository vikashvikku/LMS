import { requireRole } from "@/lib/auth";
import { getAuditStats, getAuditLogs } from "@/actions/audit";
import { ClientAuditList } from "./ClientAuditList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CalendarDays, AlertTriangle, List } from "lucide-react";

export const metadata = {
  title: "Audit & Activity | CampusOS Admin",
};

export default async function AuditPage(props) {
  await requireRole(["university_admin", "super_admin"]);

  let stats = { total: 0, today: 0, week: 0, critical: 0 };
  try {
    stats = await getAuditStats();
  } catch (e) {
    console.error("Failed to load audit stats:", e);
  }
  
  // In Next.js 16, searchParams is a Promise that must be awaited
  const resolvedParams = await props.searchParams;
  const page = parseInt(resolvedParams?.page || "1", 10);
  const moduleFilter = resolvedParams?.module || "all";
  const action = resolvedParams?.action || "all";
  const sort = resolvedParams?.sort || "newest";
  
  const { data, count } = await getAuditLogs({ page, limit: 20, module: moduleFilter, action, sort });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit & Activity</h1>
        <p className="text-muted-foreground mt-1">Monitor administrative actions and important system activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All recorded events
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Events in the last 24h
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.week}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Events since Monday
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Security / Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Deletions and Profile changes
            </p>
          </CardContent>
        </Card>
      </div>

      <ClientAuditList 
        initialData={data} 
        totalCount={count} 
        currentPage={page} 
        hasAnyRecords={stats.total > 0}
      />
    </div>
  );
}
