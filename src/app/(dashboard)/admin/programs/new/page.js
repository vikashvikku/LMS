import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClientAddProgramForm } from "./ClientAddProgramForm";

export const metadata = {
  title: "Add Program | Admin Portal",
};

export default async function AddProgramPage() {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  const { data: departments } = await supabase
    .from('departments')
    .select('id, name, code')
    .eq('organization_id', profile.organization_id)
    .order('name');

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/programs" 
          className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Program</h1>
          <p className="text-muted-foreground mt-1">Create a new academic program.</p>
        </div>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Program Details</CardTitle>
          <CardDescription>Enter the primary information for the academic program.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ClientAddProgramForm departments={departments || []} />
        </CardContent>
      </Card>
    </div>
  );
}
