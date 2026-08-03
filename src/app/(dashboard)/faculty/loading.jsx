import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function FacultyLoading() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-1">
              <Skeleton className="h-7 w-16 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="shadow-xs border-border">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-3 w-full rounded" />
              <div className="flex justify-between items-center pt-2 border-t border-border/30">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
