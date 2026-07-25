import { formatDateTime } from "@/lib/utils";
import { getStudentNotifications } from "@/lib/data/student";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markAllNotificationsAsRead } from "./actions";

export default async function StudentNotifications() {
  const notifications = await getStudentNotifications();

  const getIcon = (type) => {
    switch(type) {
      case 'alert': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Your recent alerts and system messages.</p>
        </div>
        <form action={markAllNotificationsAsRead}>
          <Button type="submit" variant="outline" size="sm" disabled={notifications.length === 0 || notifications.every(n => n.is_read)}>
            Mark all as read
          </Button>
        </form>
      </div>

      {notifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center ">
          <Bell className="h-12 w-12 text-slate-200 mb-4" />
          <h2 className="text-xl font-semibold text-foreground">All Caught Up!</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            You do not have any new notifications.
          </p>
        </Card>
      ) : (
        <Card className="">
          <div className="divide-y">
            {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex gap-4 p-4 items-start ${!notification.is_read ? 'bg-muted/30' : ''}`}
                >
                <div className="mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm ${!notification.is_read ? 'font-semibold text-foreground' : 'font-medium text-foreground/90'}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground/80">
                      {formatDateTime(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
