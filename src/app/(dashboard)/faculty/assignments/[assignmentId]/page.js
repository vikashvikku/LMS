import { formatDate, formatDateTime } from "@/lib/utils";
import { getAssignmentSubmissions } from "@/lib/data/faculty";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Edit, FileText, CheckCircle2, AlertCircle, FileBox } from "lucide-react";
import Link from "next/link";
import { PublishToggle } from "./PublishToggle";

export default async function FacultyAssignmentDetail({ params }) {
  const { assignmentId } = await params;
  const data = await getAssignmentSubmissions(assignmentId);

  if (!data) {
    notFound();
  }

  const { assignment, enrollments, submissions } = data;
  const course = assignment.sections?.subjects?.courses;
  const section = assignment.sections;
  const dueDate = new Date(assignment.due_date);
  const isPastDue = dueDate < new Date();

  // Combine enrollments and submissions to create the full roster view
  const roster = enrollments.map(enrollment => {
    const submission = submissions.find(s => s.student_id === enrollment.student_id);
    return {
      student: enrollment.profiles,
      submission: submission || null,
      status: submission ? submission.status : 'not_submitted'
    };
  });

  const submittedCount = submissions.length;
  const totalCount = enrollments.length;
  const missingCount = totalCount - submittedCount;
  
  const statusColors = {
    'submitted': 'bg-blue-100 text-blue-700 border-blue-200',
    'draft': 'bg-slate-100 text-slate-700 border-muted',
    'graded': 'bg-green-100 text-green-700 border-green-200',
    'returned': 'bg-amber-100 text-amber-700 border-amber-200',
    'not_submitted': 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link href="/faculty/assignments" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Assignments
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="bg-muted">{course?.code} · Sec {section?.name}</Badge>
              {assignment.is_published ? (
                <Badge className="bg-green-600">Published</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
              {isPastDue && <Badge variant="destructive">Past Due</Badge>}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
              {assignment.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <PublishToggle assignmentId={assignment.id} isPublished={assignment.is_published} />
            <Button asChild variant="outline">
              <Link href={`/faculty/assignments/${assignment.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground/80" />
            <span className="font-medium">Due: {formatDate(dueDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground/80" />
            <span className="font-medium">{formatDateTime(dueDate).split(", ")[1]}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground/80" />
            <span className="font-medium">{assignment.max_marks} marks</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Enrolled Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{submittedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Missing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{missingCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="details">Assignment Details</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Submissions</CardTitle>
              <CardDescription>All students enrolled in this section and their submission status.</CardDescription>
            </CardHeader>
            <CardContent>
              {roster.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b">
                      <tr>
                        <th className="text-left font-medium text-muted-foreground p-4">Student</th>
                        <th className="text-left font-medium text-muted-foreground p-4">Status</th>
                        <th className="text-left font-medium text-muted-foreground p-4">Submitted At</th>
                        <th className="text-left font-medium text-muted-foreground p-4">Files</th>
                        <th className="text-right font-medium text-muted-foreground p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {roster.map((row) => {
                        const { student, submission, status } = row;
                        const isLate = submission?.is_late;
                        const filesCount = submission?.submission_files?.length || 0;

                        return (
                          <tr key={student.id} className="hover:bg-muted">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-muted-foreground">
                                  {student.first_name?.[0]}{student.last_name?.[0]}
                                </div>
                                <span className="font-medium text-foreground">
                                  {student.first_name} {student.last_name}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={statusColors[status] || statusColors['not_submitted']}>
                                  {status.replace('_', ' ')}
                                </Badge>
                                {isLate && <Badge variant="destructive" className="text-[10px] px-1 py-0">LATE</Badge>}
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {submission?.submitted_at ? formatDateTime(submission.submitted_at) : '-'}
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {filesCount > 0 ? (
                                <div className="flex items-center gap-1">
                                  <FileBox className="h-4 w-4 text-blue-500" />
                                  <span>{filesCount}</span>
                                </div>
                              ) : '-'}
                            </td>
                            <td className="p-4 text-right">
                              {submission ? (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={`#`} className="text-blue-600 hover:text-blue-800">
                                    View & Grade
                                  </a>
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground/80 uppercase font-medium tracking-wider">Awaiting</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                  <AlertCircle className="h-12 w-12 text-muted mx-auto mb-4" />
                  <p>There are no students enrolled in this section.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Instructions & Content</CardTitle>
            </CardHeader>
            <CardContent>
              {assignment.description ? (
                <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap bg-muted p-6 rounded-lg border border-slate-100">
                  {assignment.description}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No description or instructions provided.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
