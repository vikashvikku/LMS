import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminTimetableLoading() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Selectors Bar */}
      <Card className="shadow-xs border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Skeleton className="h-9 w-48 rounded-md" />
            <Skeleton className="h-9 w-48 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Matrix Schedule Skeleton */}
      <Card className="shadow-xs border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-6 border-b border-border/50 bg-muted/20 p-3 text-center">
            {["Time", "Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
              <div key={i} className="flex justify-center">
                <Skeleton className="h-4 w-12 rounded" />
              </div>
            ))}
          </div>
          <div className="divide-y divide-border/40">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div key={row} className="grid grid-cols-6 p-3 min-h-[90px] gap-2 items-center">
                <div className="flex justify-center">
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                {[1, 2, 3, 4, 5].map((col) => (
                  <div key={col} className="p-2 rounded-lg bg-muted/30 border border-border/30 h-full flex flex-col justify-between">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-3 w-12 rounded" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
