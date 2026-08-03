import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function FacultyAssignmentsLoading() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <Skeleton className="h-9 w-44 rounded-md" />
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-xs border-border">
            <CardHeader className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-60 rounded" />
                  <Skeleton className="h-3 w-40 rounded" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full rounded" />
              <div className="flex justify-between items-center pt-3 border-t border-border/30">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
