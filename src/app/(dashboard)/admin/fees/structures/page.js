import { getAdminFeeStructures, getAdminPrograms, getSemesters } from "@/lib/data/admin";
import { requireRole } from "@/lib/auth";
import { ClientFeeStructures } from "./ClientFeeStructures";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Fee Structures | Admin Portal",
};

export default async function AdminFeeStructuresPage() {
  const profile = await requireRole(["university_admin", "super_admin"]);

  const [structures, allPrograms, allSemesters] = await Promise.all([
    getAdminFeeStructures(),
    getAdminPrograms({ pageSize: 500 }),
    getSemesters()
  ]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/fees">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Fees
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Fee Structures</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Define templates for academic period fees and assign them to students.
          </p>
        </div>
      </div>

      <ClientFeeStructures 
        initialData={structures}
        programs={allPrograms.records || []}
        semesters={allSemesters || []}
      />
    </div>
  );
}
