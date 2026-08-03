import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function FacultyCoursesLoading() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* Courses Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="shadow-xs border-border">
            <CardHeader className="space-y-2">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-48 rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-4/5 rounded" />
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border/40">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
