import { formatDateTime } from "@/lib/utils";
import { getStudentAssignmentDetails } from "@/lib/data/student";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, AlertCircle, Download, CheckCircle, Upload } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default async function AssignmentDetails({ params }) {
  const { assignmentId } = await params;
  const assignment = await getStudentAssignmentDetails(assignmentId);

  if (!assignment) {
    notFound();
  }

  const course = assignment.sections?.subjects?.courses;
  const dueDate = new Date(assignment.due_date);
  const sub = assignment.student_submission;
  const isOverdue = dueDate < new Date() && (!sub || sub.status === 'draft');
  const grade = sub?.grades;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <Link href="/student/assignments" className="text-sm text-blue-600 hover:underline mb-2">
          &larr; Back to Assignments
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-muted/50 text-sm">{course?.code || 'N/A'}</Badge>
          {isOverdue ? (
            <Badge variant="destructive">Overdue</Badge>
          ) : sub?.status === 'submitted' ? (
            <Badge className="bg-green-600 hover:bg-green-700">Submitted</Badge>
          ) : (
            <Badge variant="secondary">Pending</Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">{assignment.title}</h1>
        <p className="text-muted-foreground">{course?.title} ({assignment.sections?.name})</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground/90">
                {assignment.description || "No description provided."}
              </div>
            </CardContent>
          </Card>

          {assignment.assignment_files && assignment.assignment_files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reference Materials</CardTitle>
                <CardDescription>Files attached to this assignment by the faculty.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignment.assignment_files.map(file => (
                    <div key={file.id} className="flex items-center justify-between border p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground">{(file.file_size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={file.storage_path} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {grade && grade.is_released && (
            <Card className="border-green-200 shadow-sm bg-green-50/30">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Grade & Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-green-700">{grade.marks_obtained}</span>
                  <span className="text-lg text-muted-foreground">/ {assignment.max_marks} marks</span>
                </div>
                {grade.feedback && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground/90 mb-1">Feedback from {grade.profiles?.first_name || 'Faculty'}:</h4>
                    <p className="text-sm text-foreground/90 bg-background p-3 rounded border">{grade.feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-base">Submission Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Due Date</span>
                <span className="font-medium">{formatDateTime(dueDate)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Max Marks</span>
                <span className="font-medium">{assignment.max_marks}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Late Submission</span>
                <span className="font-medium">{assignment.allow_late_submission ? 'Allowed' : 'Not Allowed'}</span>
              </div>
              
              {sub?.status === 'submitted' && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Submitted On</span>
                    <span className="font-medium text-green-700">
                      {formatDateTime(sub.submitted_at)}
                    </span>
                  </div>
                  {sub.submission_files && sub.submission_files.length > 0 && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <p className="text-sm font-medium">Your Files</p>
                      {sub.submission_files.map(f => (
                        <div key={f.id} className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="truncate flex-1">{f.file_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
            {!grade?.is_released && (
              <CardFooter className="bg-muted/50 border-t pt-4">
                <div className="w-full text-center">
                  <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Storage policies for direct submission upload are currently pending security configuration.
                  </p>
                  <Button disabled className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {sub?.status === 'submitted' ? 'Resubmit' : 'Submit Assignment'}
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
