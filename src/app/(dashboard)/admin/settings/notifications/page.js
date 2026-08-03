import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationsForm } from "./NotificationsForm";

export const metadata = {
  title: "Notifications | Settings",
};

export default async function NotificationsPage() {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("organization_settings")
    .select("notification_email, notification_announcements, notification_fees, notification_students")
    .eq("organization_id", profile.organization_id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Configure how and when the system sends notifications to users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Notifications</CardTitle>
          <CardDescription>
            Enable or disable different types of automated notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationsForm settings={settings || {}} />
        </CardContent>
      </Card>
    </div>
  );
}
