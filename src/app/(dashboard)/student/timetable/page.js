import { getStudentTimetable } from "@/lib/data/student";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function StudentTimetable() {
  const timetable = await getStudentTimetable();

  // Group by day of week
  const groupedTimetable = timetable.reduce((acc, entry) => {
    if (!acc[entry.day_of_week]) {
      acc[entry.day_of_week] = [];
    }
    acc[entry.day_of_week].push(entry);
    return acc;
  }, {});

  const currentDay = new Date().getDay();
  // Filter out days with no classes, or just show Monday to Friday if empty.
  const activeDays = Object.keys(groupedTimetable).length > 0
    ? Object.keys(groupedTimetable).map(Number).sort()
    : [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Weekly Timetable</h1>
        <p className="text-muted-foreground">View your scheduled classes for the week.</p>
      </div>

      {timetable.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-12 w-12 text-slate-200 mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Classes Scheduled</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            You do not have any classes scheduled for this term.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeDays.map((dayNum) => {
            const classes = groupedTimetable[dayNum] || [];
            const isToday = dayNum === currentDay;

            return (
              <Card key={dayNum} className={isToday ? "border-blue-200 shadow-md ring-1 ring-blue-100" : ""}>
                <CardHeader className={isToday ? "bg-blue-50/50 pb-4" : "pb-4"}>
                  <CardTitle className="flex items-center justify-between">
                    <span>{DAYS[dayNum]}</span>
                    {isToday && <Badge variant="default" className="bg-blue-600">Today</Badge>}
                  </CardTitle>
                  <CardDescription>
                    {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {classes.length > 0 ? (
                    <div className="space-y-4">
                      {classes.map((c) => {
                        const course = c.sections?.subjects?.courses;
                        const faculty = c.profiles;
                        const room = c.rooms;
                        
                        // Format time (assuming format "HH:MM:SS" or "HH:MM")
                        const startTime = c.start_time.substring(0, 5);
                        const endTime = c.end_time.substring(0, 5);

                        return (
                          <div key={c.id} className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between">
                              <span className="font-semibold text-foreground">{course?.code}</span>
                              <Badge variant="outline" className="text-xs bg-muted/50 font-medium">
                                {startTime} - {endTime}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground/90">{course?.title}</p>
                            
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                <span className="truncate">{faculty ? `${faculty.first_name} ${faculty.last_name}` : "TBA"}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate">{room?.name || "TBA"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground/80">
                      Free day
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
