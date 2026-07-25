import { getFacultySectionGradebook } from "@/lib/data/faculty";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function SectionGradebook({ params }) {
  const { sectionId } = await params;
  const data = await getFacultySectionGradebook(sectionId);

  if (!data) {
    notFound();
  }

  const { section, enrollments, assignments, submissions } = data;
  const course = section.subjects?.courses;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/faculty/grades" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Gradebooks
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="bg-muted">{section.subjects?.code}</Badge>
          <Badge className="bg-blue-600">Section {section.name}</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
          {section.subjects?.title} Gradebook
        </h1>
        <p className="text-muted-foreground">
          Review submissions and assign grades for enrolled students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Grades</CardTitle>
          <CardDescription>Click on any pending submission to review and grade it.</CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
              <AlertCircle className="h-12 w-12 text-muted mx-auto mb-4" />
              <p>No active enrollments in this section.</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
              <p>No published assignments for this section.</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="text-left font-medium text-muted-foreground p-4 sticky left-0 bg-muted z-10 border-r min-w-[200px]">
                      Student
                    </th>
                    {assignments.map(a => (
                      <th key={a.id} className="text-center font-medium text-muted-foreground p-4 min-w-[150px]">
                        <div className="truncate w-full max-w-[150px]" title={a.title}>{a.title}</div>
                        <div className="text-xs font-normal text-muted-foreground/80 mt-0.5">/ {a.max_marks} marks</div>
                      </th>
                    ))}
                    <th className="text-right font-medium text-muted-foreground p-4 min-w-[100px]">
                      Average
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {enrollments.map((e) => {
                    const student = e.profiles;
                    
                    let totalObtained = 0;
                    let totalMax = 0;

                    return (
                      <tr key={e.student_id} className="hover:bg-muted">
                        <td className="p-4 sticky left-0 bg-white border-r group-hover:bg-muted z-10">
                          <div className="font-medium text-foreground">
                            {student.first_name} {student.last_name}
                          </div>
                        </td>
                        
                        {assignments.map(a => {
                          const sub = submissions.find(s => s.assignment_id === a.id && s.student_id === e.student_id);
                          const grade = sub?.grades?.[0]; // due to structure

                          if (grade) {
                            totalObtained += Number(grade.marks_obtained);
                            totalMax += Number(a.max_marks);
                          }

                          return (
                            <td key={a.id} className="p-4 text-center border-l border-slate-100 first:border-none">
                              {sub ? (
                                grade ? (
                                  <Link 
                                    href={`/faculty/assignments/${a.id}/submissions/${sub.id}`}
                                    className="font-medium text-foreground hover:text-blue-600 hover:underline inline-flex items-center gap-1.5"
                                  >
                                    <span>{grade.marks_obtained}</span>
                                    {grade.is_released && <CheckCircle2 className="h-3 w-3 text-green-500" title="Released" />}
                                  </Link>
                                ) : (
                                  <Link 
                                    href={`/faculty/assignments/${a.id}/submissions/${sub.id}`}
                                    className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-sm border border-amber-200 hover:bg-amber-100 transition-colors"
                                  >
                                    <Clock className="h-3 w-3" />
                                    Pending
                                  </Link>
                                )
                              ) : (
                                <span className="text-muted-foreground/80 text-xs uppercase tracking-wider">Missing</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="p-4 text-right font-medium">
                          {totalMax > 0 ? (
                            <span className="text-foreground">
                              {((totalObtained / totalMax) * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground/80">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
