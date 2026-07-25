import { formatDate } from "@/lib/utils";
import { getFacultySectionAttendance } from "@/lib/data/faculty";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { CreateSessionDialog } from "./CreateSessionDialog";

export default async function FacultySectionAttendance({ params }) {
  const { sectionId } = await params;
  const data = await getFacultySectionAttendance(sectionId);

  if (!data) {
    notFound();
  }

  const { section, enrolledCount, sessions } = data;
  const course = section.subjects?.courses;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link href="/faculty/attendance" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Attendance Overview
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="bg-muted">{course?.code}</Badge>
              <Badge className="bg-blue-600">Section {section.name}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
              {course?.title || 'Untitled Course'}
            </h1>
            <p className="text-muted-foreground">
              Manage attendance for {enrolledCount} enrolled students.
            </p>
          </div>
          <CreateSessionDialog sectionId={sectionId} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Sessions History</CardTitle>
          <CardDescription>All previous attendance sessions for this section.</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="text-left font-medium text-muted-foreground p-4">Date</th>
                    <th className="text-left font-medium text-muted-foreground p-4">Time</th>
                    <th className="text-left font-medium text-muted-foreground p-4">Marked By</th>
                    <th className="text-left font-medium text-muted-foreground p-4">Completion</th>
                    <th className="text-left font-medium text-muted-foreground p-4">Status Stats</th>
                    <th className="text-right font-medium text-muted-foreground p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sessions.map((session) => {
                    const markedCount = session.attendance_records?.length || 0;
                    const presentCount = session.attendance_records?.filter(r => r.status === 'present').length || 0;
                    const absentCount = session.attendance_records?.filter(r => r.status === 'absent').length || 0;
                    const isComplete = markedCount === enrolledCount && enrolledCount > 0;

                    return (
                      <tr key={session.id} className="hover:bg-muted transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2 font-medium">
                            <Calendar className="h-4 w-4 text-muted-foreground/80" />
                            {formatDate(session.session_date)}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground/80" />
                            {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {session.profiles?.first_name} {session.profiles?.last_name}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm">
                              <span className="font-medium text-foreground">{markedCount}</span>
                              <span className="text-muted-foreground"> / {enrolledCount}</span>
                            </div>
                            {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 text-xs font-medium">
                            {presentCount > 0 && <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-sm">{presentCount} P</span>}
                            {absentCount > 0 && <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-sm">{absentCount} A</span>}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/faculty/attendance/${sectionId}/${session.id}`}>
                              {isComplete ? 'View/Edit' : 'Continue Marking'} &rarr;
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
              <Calendar className="h-12 w-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">No Sessions Yet</h3>
              <p>Create a session to start tracking attendance for this section.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="#">Use the Take Attendance button above</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
