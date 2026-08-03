import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminFacultyLoading() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* 4 Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-xs border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent className="space-y-1">
              <Skeleton className="h-7 w-14 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Skeleton className="h-9 w-full sm:w-80 rounded-md" />
            <div className="flex gap-2 w-full sm:w-auto">
              <Skeleton className="h-9 w-32 rounded-md" />
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Data Table */}
      <Card className="shadow-xs border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <div className="divide-y divide-border/40">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36 rounded" />
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                </div>
                <Skeleton className="h-4 w-28 rounded hidden sm:block" />
                <Skeleton className="h-4 w-20 rounded hidden md:block" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
