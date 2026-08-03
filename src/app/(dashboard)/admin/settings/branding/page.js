import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandingForm } from "./BrandingForm";

export const metadata = {
  title: "Branding | Settings",
};

export default async function BrandingPage() {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("organization_settings")
    .select("branding_primary_color, branding_secondary_color, branding_logo_url")
    .eq("organization_id", profile.organization_id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Branding</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of your CampusOS instance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Colors</CardTitle>
          <CardDescription>
            Update the primary and secondary colors used throughout the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandingForm settings={settings || {}} />
        </CardContent>
      </Card>
    </div>
  );
}
