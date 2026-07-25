import { formatDate } from "@/lib/utils";
import { getStudentAnnouncements } from "@/lib/data/student";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default async function StudentAnnouncements() {
  const announcements = await getStudentAnnouncements();

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Announcements</h1>
        <p className="text-muted-foreground">Stay up to date with university news and notices.</p>
      </div>

      {announcements.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center ">
          <Bell className="h-12 w-12 text-slate-200 mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No Announcements</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            You do not have any active announcements at this time.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <span className="text-xs text-muted-foreground/80 font-medium">
                    {formatDate(announcement.created_at)}
                  </span>
                </div>
                <CardDescription>
                  From: {announcement.author?.first_name} {announcement.author?.last_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
                  {announcement.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
