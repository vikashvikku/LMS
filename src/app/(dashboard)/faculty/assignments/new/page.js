import { getFacultyCourses } from "@/lib/data/faculty";
import { AssignmentForm } from "../AssignmentForm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function NewAssignmentPage() {
  // Fetch courses assigned to the faculty to populate the section dropdown
  const availableSections = await getFacultyCourses();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/faculty/assignments" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Assignments
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create Assignment
        </h1>
        <p className="text-muted-foreground">
          Assignments created here will be visible to students in the selected section once published.
        </p>
      </div>

      {availableSections.length === 0 ? (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 max-w-2xl">
          <h3 className="font-semibold mb-1">No assigned sections</h3>
          <p className="text-sm">You must be assigned to at least one section before you can create assignments.</p>
        </div>
      ) : (
        <AssignmentForm availableSections={availableSections} />
      )}
    </div>
  );
}
