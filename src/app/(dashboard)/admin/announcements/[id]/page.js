import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { requireRole } from "@/lib/auth";
import { getAdminAnnouncementDetails } from "@/actions/announcements";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Bell, CalendarClock, Globe, Users, Target, Clock, CheckCircle2 } from "lucide-react";
import { ClientEditControls } from "./ClientEditControls";

export const metadata = {
  title: "Announcement Details | CampusOS"
};

const getStatusBadge = (status) => {
  switch (status) {
    case "published": return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 gap-1"><CheckCircle2 className="h-3 w-3"/> Published</Badge>;
    case "scheduled": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 gap-1"><Clock className="h-3 w-3"/> Scheduled</Badge>;
    case "draft": return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Draft</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const getAudienceDisplay = (item) => {
  const { audience_type, program, section } = item;
  if (audience_type === 'organization') return { icon: Globe, label: "Everyone", desc: "All users in the organization" };
  if (audience_type === 'students') return { icon: Users, label: "All Students", desc: "Visible to all enrolled students" };
  if (audience_type === 'faculty') return { icon: Users, label: "All Faculty", desc: "Visible to all faculty members" };
  if (audience_type === 'program' && program) return { icon: Target, label: "Specific Program", desc: program.name };
  if (audience_type === 'section' && section) return { icon: Target, label: "Specific Section", desc: `${section.name} (${item.program?.name})` };
  return { icon: Target, label: "Custom", desc: audience_type };
};

export default async function AnnouncementDetailsPage(props) {
  const params = await props.params;
  const id = params.id;
  await requireRole(["university_admin", "super_admin"]);

  const announcement = await getAdminAnnouncementDetails(id);

  if (!announcement) {
    notFound();
  }

  const audience = getAudienceDisplay(announcement);
  const AudienceIcon = audience.icon;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3 text-muted-foreground">
            <Link href="/admin/announcements">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Announcements
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{announcement.title}</h1>
            {getStatusBadge(announcement.status)}
          </div>
          <p className="text-muted-foreground mt-1">
            Created by {announcement.author?.first_name} {announcement.author?.last_name} on {format(new Date(announcement.created_at), "MMM d, yyyy")}
          </p>
        </div>

        <ClientEditControls announcement={announcement} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Announcement Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap">
                {announcement.message}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <AudienceIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">{audience.label}</p>
                  <p className="text-sm text-muted-foreground">{audience.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Publishing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-none">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-muted-foreground capitalize">{announcement.status}</p>
                </div>
              </div>

              {announcement.published_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-none">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Published At</p>
                    <p className="text-muted-foreground">{format(new Date(announcement.published_at), "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                </div>
              )}

              {announcement.scheduled_at && announcement.status === "scheduled" && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-none">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Scheduled For</p>
                    <p className="text-muted-foreground">{format(new Date(announcement.scheduled_at), "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
