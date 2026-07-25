import { getStudentAttendance } from "@/lib/data/student";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export default async function StudentAttendance() {
  const attendance = await getStudentAttendance();

  const totalClasses = attendance.reduce((sum, a) => sum + a.total, 0);
  const totalPresent = attendance.reduce((sum, a) => sum + a.present + a.late, 0);
  const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance</h1>
        <p className="text-muted-foreground">Track your attendance across all enrolled courses.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{overallPercentage}%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full mt-4 overflow-hidden">
              <div 
                className={`h-full ${overallPercentage >= 75 ? 'bg-green-500' : overallPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {attendance.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center ">
          <CheckCircle className="h-12 w-12 text-slate-200 mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Records Found</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            No attendance records have been posted for your classes yet.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {attendance.map((course) => {
            return (
              <Card key={course.section_id} className=" hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-muted/50">
                      {course.course_code}
                    </Badge>
                    <Badge 
                      className={
                        course.percentage >= 75 ? 'bg-green-600' : 
                        course.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-600'
                      }
                    >
                      {course.percentage}%
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course.course_title}</CardTitle>
                  <CardDescription>Section: {course.section_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-muted h-2 rounded-full mb-4 overflow-hidden">
                    <div 
                      className={`h-full ${course.percentage >= 75 ? 'bg-green-500' : course.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      style={{ width: `${course.percentage}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div className="bg-muted/50 p-2 rounded">
                      <p className="text-muted-foreground text-xs uppercase font-medium">Total</p>
                      <p className="font-semibold">{course.total}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-green-700 text-xs uppercase font-medium">Present</p>
                      <p className="font-semibold text-green-700">{course.present}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-red-700 text-xs uppercase font-medium">Absent</p>
                      <p className="font-semibold text-red-700">{course.absent}</p>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                      <p className="text-yellow-700 text-xs uppercase font-medium">Late</p>
                      <p className="font-semibold text-yellow-700">{course.late}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
