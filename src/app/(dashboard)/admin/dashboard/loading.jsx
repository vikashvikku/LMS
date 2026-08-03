import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminDashboardLoading() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <Skeleton className="h-5 w-[420px] rounded-md" />
      </div>

      {/* 5 Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-border shadow-xs">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <div className="mt-4 space-y-1.5">
                <Skeleton className="h-8 w-16 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Overview & Announcements */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Quick Actions & Operations (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-72 rounded" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-2">
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs">
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-40 rounded" />
              <Skeleton className="h-4 w-60 rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3 w-48 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: System Status & Announcements */}
        <div className="space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-36 rounded" />
              <Skeleton className="h-4 w-44 rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-border/30 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-2/3 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
