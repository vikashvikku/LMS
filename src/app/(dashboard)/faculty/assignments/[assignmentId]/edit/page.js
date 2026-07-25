import { getFacultyAssignmentById } from "@/lib/data/faculty";
import { AssignmentForm } from "../../AssignmentForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function EditAssignmentPage({ params }) {
  const { assignmentId } = await params;
  const assignment = await getFacultyAssignmentById(assignmentId);

  if (!assignment) {
    notFound();
  }

  const course = assignment.sections?.subjects?.courses;
  const section = assignment.sections;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/faculty/assignments/${assignment.id}`} className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Assignment Detail
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="bg-muted">{course?.code} · Sec {section?.name}</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Edit Assignment
        </h1>
      </div>

      <AssignmentForm initialData={assignment} />
    </div>
  );
}
