import { requireProfile } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default async function RoleDashboardFallback({ params }) {
  const profile = await requireProfile();
  const { role } = await params;

  // The student dashboard will be intercepted by a more specific route.
  // This serves as the fallback for faculty, department-head, etc.

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Clock className="h-12 w-12 text-slate-400" />
          </div>
          <CardTitle className="text-2xl capitalize">{role.replace('-', ' ')} Portal</CardTitle>
          <CardDescription>
            Coming in Next Phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            The {role.replace('-', ' ')} dashboard is currently under development. Please check back later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
