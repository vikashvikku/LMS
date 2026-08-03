import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function StudentGradesLoading() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* GPA Overview Card */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-xs border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-1">
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Semester Grades Table */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-48 rounded" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
              <div className="space-y-1">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16 rounded hidden sm:block" />
                <Skeleton className="h-7 w-12 rounded-md" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
