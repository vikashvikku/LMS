import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OrganizationForm } from "./OrganizationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Organization Profile | Settings",
};

export default async function OrganizationProfilePage() {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Organization Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your institution&apos;s public profile and contact information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            This information will be displayed on reports and official documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationForm organization={organization || {}} />
        </CardContent>
      </Card>
    </div>
  );
}
