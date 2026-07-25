import { formatDate } from "@/lib/utils";
import { getStudentAssignments } from "@/lib/data/student";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function StudentAssignments() {
  const assignments = await getStudentAssignments();

  const pending = assignments.filter(a => !a.student_submission || a.student_submission.status === 'draft');
  const graded = assignments.filter(a => a.student_submission?.grades && a.student_submission.grades.is_released);
  const submitted = assignments.filter(a => a.student_submission && ['submitted', 'graded'].includes(a.student_submission.status) && !graded.includes(a));

  const renderAssignmentList = (list, emptyMessage) => {
    if (list.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed mt-4 bg-background">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {list.map((assignment) => {
          const course = assignment.sections?.subjects?.courses;
          const dueDate = new Date(assignment.due_date);
          const isOverdue = dueDate < new Date() && (!assignment.student_submission || assignment.student_submission.status === 'draft');
          const sub = assignment.student_submission;

          return (
            <Card key={assignment.id} className="flex flex-col hover:shadow-md transition-shadow ">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-muted/50">
                    {course?.code || 'N/A'}
                  </Badge>
                  {isOverdue ? (
                    <Badge variant="destructive">Overdue</Badge>
                  ) : sub?.grades?.is_released ? (
                    <Badge className="bg-blue-600 hover:bg-blue-700">Graded</Badge>
                  ) : ['submitted', 'graded'].includes(sub?.status) ? (
                    <Badge className="bg-green-600 hover:bg-green-700">Submitted</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>
                <CardTitle className="line-clamp-2 text-lg">{assignment.title}</CardTitle>
                <CardDescription className="line-clamp-1">{course?.title}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                    Due: {formatDate(dueDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Max Marks: {assignment.max_marks}</span>
                </div>
                {sub?.grades?.is_released && (
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 p-2 rounded">
                    <CheckCircle className="h-4 w-4" />
                    <span>Score: {sub.grades.marks_obtained} / {assignment.max_marks}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button asChild variant={isOverdue ? "default" : "outline"} className="w-full">
                  <Link href={`/student/assignments/${assignment.id}`}>
                    {['submitted', 'graded'].includes(sub?.status) ? 'View Submission' : 'Submit Now'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Assignments</h1>
        <p className="text-muted-foreground">Manage your course assignments and submissions.</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[500px]">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submitted.length})</TabsTrigger>
          <TabsTrigger value="graded">Graded ({graded.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {renderAssignmentList(assignments, "No assignments have been posted.")}
        </TabsContent>
        <TabsContent value="pending">
          {renderAssignmentList(pending, "You have no pending assignments! Great job.")}
        </TabsContent>
        <TabsContent value="submitted">
          {renderAssignmentList(submitted, "You haven't submitted any assignments yet.")}
        </TabsContent>
        <TabsContent value="graded">
          {renderAssignmentList(graded, "None of your assignments have been graded yet.")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
