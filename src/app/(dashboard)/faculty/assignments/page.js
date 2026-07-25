import { formatDate } from "@/lib/utils";
import { getFacultyAssignments } from "@/lib/data/faculty";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, Users, Clock } from "lucide-react";
import Link from "next/link";

export default async function FacultyAssignmentsList() {
  const assignments = await getFacultyAssignments();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assignments</h1>
          <p className="text-muted-foreground">Manage assignments for your assigned sections.</p>
        </div>
        <Button asChild>
          <Link href="/faculty/assignments/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Assignment
          </Link>
        </Button>
      </div>

      {assignments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Assignments Found</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            You have not created any assignments yet.
          </p>
          <Button asChild className="mt-6">
            <Link href="/faculty/assignments/new">
              Create Your First Assignment
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => {
            const section = assignment.sections;
            const course = section?.subjects?.courses;
            const enrolledCount = section?.student_enrollments?.[0]?.count || 0;
            const submissionCount = assignment.submissions?.[0]?.count || 0;
            const dueDate = new Date(assignment.due_date);
            const isPastDue = dueDate < new Date();

            return (
              <Card key={assignment.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-muted">
                      {course?.code} · Sec {section?.name}
                    </Badge>
                    {assignment.is_published ? (
                      <Badge className="bg-green-600">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{assignment.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className={`h-4 w-4 ${isPastDue ? 'text-red-500' : 'text-muted-foreground/80'}`} />
                    <span className={isPastDue ? 'text-red-600 font-medium' : ''}>
                      Due: {formatDate(dueDate)}
                    </span>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md border text-sm">
                    <div className="flex items-center justify-between mb-1 text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Submissions</span>
                      <span className="font-medium text-foreground">{submissionCount} / {enrolledCount}</span>
                    </div>
                    {/* Basic progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${enrolledCount > 0 ? (submissionCount / enrolledCount) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/faculty/assignments/${assignment.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
