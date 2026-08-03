import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManager } from "./UserManager";

export const metadata = {
  title: "User Management | Settings",
};

export default async function UserManagementPage() {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role, is_active")
    .eq("organization_id", profile.organization_id)
    .order("first_name");

  let enrichedUsers = users || [];
  try {
    const adminClient = createAdminClient();
    const { data: authData } = await adminClient.auth.admin.listUsers();
    if (authData?.users) {
      const emailMap = new Map(authData.users.map((u) => [u.id, u.email]));
      enrichedUsers = (users || []).map((u) => ({
        ...u,
        email: emailMap.get(u.id) || null,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch auth emails for user settings:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">User & Role Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage user roles and system access.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            View all users in your organization, change their roles, or disable their access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserManager users={enrichedUsers} currentUserId={profile.id} />
        </CardContent>
      </Card>
    </div>
  );
}
