import { getStudentGrades } from "@/lib/data/student";
import GradesClient from "./GradesClient";

export default async function StudentGrades() {
  const grades = await getStudentGrades();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Grades & Results</h1>
        <p className="text-muted-foreground">View your academic performance and feedback.</p>
      </div>
      <GradesClient initialGrades={grades} />
    </div>
  );
}
