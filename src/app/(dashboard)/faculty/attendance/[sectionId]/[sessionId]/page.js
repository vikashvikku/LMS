import { formatDate } from "@/lib/utils";
import { getAttendanceSession } from "@/lib/data/faculty";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { MarkAttendanceForm } from "./MarkAttendanceForm";

export default async function FacultyAttendanceSessionDetail({ params }) {
  const { sectionId, sessionId } = await params;
  const data = await getAttendanceSession(sessionId);

  // Authorization and existence check
  if (!data || data.session.section_id !== sectionId) {
    notFound();
  }

  const { session, enrollments, records } = data;
  const course = session.sections?.subjects?.courses;
  const section = session.sections;

  const markedCount = records.length;
  const totalCount = enrollments.length;
  const isComplete = markedCount === totalCount && totalCount > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link href={`/faculty/attendance/${sectionId}`} className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Section Sessions
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="bg-muted">{course?.code}</Badge>
          <Badge className="bg-blue-600">Section {section?.name}</Badge>
          {isComplete ? (
            <Badge className="bg-green-600">Complete</Badge>
          ) : (
            <Badge variant="secondary">Incomplete</Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Take Attendance
        </h1>
        
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground/80" />
            <span className="font-medium text-foreground">
              {formatDate(session.session_date)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground/80" />
            <span className="font-medium text-foreground">
              {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Roster</CardTitle>
          <CardDescription>
            Select the attendance status for each enrolled student.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <MarkAttendanceForm 
              session={session} 
              sectionId={sectionId}
              enrollments={enrollments} 
              existingRecords={records} 
            />
          ) : (
            <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
              <p>There are currently no active students enrolled in this section.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
