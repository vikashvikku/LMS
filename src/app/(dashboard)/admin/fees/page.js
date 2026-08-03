import { getAdminFeesStatistics, getAdminStudentFees, getAdminPrograms, getSemesters } from "@/lib/data/admin";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, IndianRupee, Clock, CheckCircle } from "lucide-react";
import { ClientFeeList } from "./ClientFeeList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Fees Management | Admin Portal",
};

export default async function AdminFeesPage({ searchParams }) {
  // Force recompile to clear Next.js route cache
  const profile = await requireRole(["university_admin", "super_admin"]);

  const awaitedSearchParams = await searchParams;
  const search = awaitedSearchParams.search || "";
  const programId = awaitedSearchParams.programId || "";
  const semesterId = awaitedSearchParams.semesterId || "";
  const status = awaitedSearchParams.status || "";

  const [stats, feesData, allPrograms, allSemesters] = await Promise.all([
    getAdminFeesStatistics(profile),
    getAdminStudentFees({ search, programId, semesterId, status }),
    getAdminPrograms({ pageSize: 500 }),
    getSemesters()
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Fees Management</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Track student payments, manage fee structures, and view balances.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/fees/structures">
            <Button variant="outline">Fee Structures</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expected</CardTitle>
            <CreditCard className="h-4 w-4 text-primary opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.expected)}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.collected)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-amber-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.outstanding)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Amount</CardTitle>
            <Clock className={`h-4 w-4 opacity-80 ${stats.overdue > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.overdue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <ClientFeeList 
        initialData={feesData} 
        programs={allPrograms.records || []}
        semesters={allSemesters || []}
        currentSearch={search} 
        currentProgram={programId}
        currentSemester={semesterId}
        currentStatus={status}
      />
    </div>
  );
}
