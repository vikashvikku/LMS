"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateNotificationPreferencesAction } from "@/actions/settings";

export function NotificationsForm({ settings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States
  const [email, setEmail] = useState(settings?.notification_email ?? true);
  const [announcements, setAnnouncements] = useState(settings?.notification_announcements ?? true);
  const [fees, setFees] = useState(settings?.notification_fees ?? true);
  const [students, setStudents] = useState(settings?.notification_students ?? true);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("notification_email", email);
    formData.append("notification_announcements", announcements);
    formData.append("notification_fees", fees);
    formData.append("notification_students", students);

    const res = await updateNotificationPreferencesAction(formData);
    
    if (res.error) alert(res.error);
    else alert("Preferences updated successfully");
    
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-0.5">
            <Label className="text-base">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Allow the system to send emails to users.</p>
          </div>
          <Switch checked={email} onCheckedChange={setEmail} />
        </div>
        
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-0.5">
            <Label className="text-base">Announcement Alerts</Label>
            <p className="text-sm text-muted-foreground">Notify users when a new announcement is posted.</p>
          </div>
          <Switch checked={announcements} onCheckedChange={setAnnouncements} />
        </div>

        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-0.5">
            <Label className="text-base">Fee Reminders</Label>
            <p className="text-sm text-muted-foreground">Automatically send fee payment reminders to students and parents.</p>
          </div>
          <Switch checked={fees} onCheckedChange={setFees} />
        </div>

        <div className="flex items-center justify-between pb-4">
          <div className="space-y-0.5">
            <Label className="text-base">Student Activity</Label>
            <p className="text-sm text-muted-foreground">Notify parents of student absences or low grades.</p>
          </div>
          <Switch checked={students} onCheckedChange={setStudents} />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </form>
  );
}
