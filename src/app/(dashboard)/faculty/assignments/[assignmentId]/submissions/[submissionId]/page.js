import { formatDateTime } from "@/lib/utils";
import { getSubmissionForGrading } from "@/lib/data/faculty";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileBox, CheckCircle2, User, Download, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { GradeSubmissionForm } from "./GradeSubmissionForm";

export default async function FacultySubmissionReview({ params }) {
  const { assignmentId, submissionId } = await params;
  const data = await getSubmissionForGrading(assignmentId, submissionId);

  if (!data) {
    notFound();
  }

  const { assignment, submission } = data;
  const student = submission.profiles;
  const grade = submission.grades?.[0]; // One grade per submission
  const files = submission.submission_files || [];
  
  const submittedAt = submission.submitted_at ? new Date(submission.submitted_at) : null;
  const isLate = submission.is_late;
  
  const statusColors = {
    'submitted': 'bg-blue-100 text-blue-800',
    'draft': 'bg-slate-100 text-slate-800',
    'graded': 'bg-green-100 text-green-800',
    'returned': 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link href={`/faculty/assignments/${assignment.id}`} className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Assignment Roster
        </Link>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <Badge variant="outline" className="bg-muted">{assignment.sections?.subjects?.code}</Badge>
          <Badge className={statusColors[submission.status] || 'bg-slate-100 text-slate-800'}>
            {submission.status.toUpperCase()}
          </Badge>
          {isLate && <Badge variant="destructive">LATE SUBMISSION</Badge>}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          {student.first_name} {student.last_name}
        </h1>
        <p className="text-muted-foreground">
          Reviewing submission for <span className="font-medium text-slate-700">{assignment.title}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Submission Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileBox className="h-5 w-5 text-muted-foreground/80" />
                  Submission Files
                </CardTitle>
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {submittedAt ? formatDateTime(submittedAt) : 'Not submitted yet'}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {files.length > 0 ? (
                <div className="space-y-3">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground">{(file.file_size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      {/* For a real app, this would use a signed URL API route to fetch from the private bucket securely */}
                      <Button variant="outline" size="sm" asChild>
                        <a href="#">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground bg-muted rounded-lg border border-dashed">
                  <p>No files attached to this submission.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* If the schema had a text_response column, it would go here */}
        </div>

        {/* Right Column: Grading Panel */}
        <div className="space-y-6">
          <Card className="border-blue-200 shadow-sm sticky top-6">
            <CardHeader className="bg-blue-50/50 border-b pb-4">
              <CardTitle className="text-lg">Grading Panel</CardTitle>
              <CardDescription>Assign marks and provide feedback.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <GradeSubmissionForm 
                assignmentId={assignment.id}
                submissionId={submission.id}
                maxMarks={assignment.max_marks}
                initialGrade={grade}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
