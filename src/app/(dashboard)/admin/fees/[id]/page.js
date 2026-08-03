import { getAdminStudentFeeDetails } from "@/lib/data/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, User, Building, Calendar as CalendarIcon, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ClientRecordPaymentDialog } from "./ClientRecordPaymentDialog";

export const metadata = {
  title: "Student Fee Details | Admin Portal",
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'paid': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>;
    case 'partial': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Partially Paid</Badge>;
    case 'overdue': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>;
    case 'pending':
    default: return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Unpaid</Badge>;
  }
};

export default async function AdminFeeDetailsPage({ params }) {
  const awaitedParams = await params;
  const feeId = awaitedParams.id;
  
  const fee = await getAdminStudentFeeDetails(feeId);
  
  if (!fee) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/fees">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Fees List
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Fee Summary
            {getStatusBadge(fee.status)}
          </h1>
        </div>
        <div className="flex gap-2">
          {fee.balance > 0 && (
            <ClientRecordPaymentDialog fee={fee} />
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Student Info */}
        <Card className="border-border shadow-sm md:col-span-2">
          <CardHeader className="bg-muted/30 border-b border-border pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Student Name</p>
                <p className="text-base font-semibold">{fee.student.first_name} {fee.student.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Enrollment / ID Number</p>
                <p className="text-base font-semibold">{fee.student.id.split('-')[0].toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Building className="h-4 w-4" /> Academic Period
                </p>
                <p className="text-base font-semibold">{fee.semester?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" /> Fee Structure
                </p>
                <p className="text-base font-semibold">{fee.fee_structure?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-primary/5 border-b border-border pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Total Fee:</span>
                <span className="font-semibold text-lg">{formatCurrency(fee.total_amount)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Total Paid:</span>
                <span className="font-semibold text-emerald-600 text-lg">{formatCurrency(fee.paid)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Balance Due:</span>
                <span className={`font-bold text-xl ${fee.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {formatCurrency(fee.balance)}
                </span>
              </div>
              <div className="pt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> 
                Due Date: {fee.due_date ? format(new Date(fee.due_date), "dd MMM yyyy") : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Breakdown & History */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Breakdown */}
        <Card className="border-border shadow-sm h-full">
          <CardHeader>
            <CardTitle>Fee Breakdown</CardTitle>
            <CardDescription>Line items based on assigned fee structure.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fee.fee_structure?.components?.length > 0 ? (
                fee.fee_structure.components.map((comp, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="font-medium">{comp.name}</span>
                    <span>{formatCurrency(comp.amount)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">Base Fee</span>
                  <span>{formatCurrency(fee.fee_structure?.base_amount)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="border-border shadow-sm h-full">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Transactions recorded against this fee.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {fee.payments?.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>DATE</TableHead>
                      <TableHead>METHOD</TableHead>
                      <TableHead>RECEIPT NO.</TableHead>
                      <TableHead className="text-right">AMOUNT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fee.payments.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(payment.paid_at || payment.created_at || new Date()), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="capitalize">{payment.payment_method}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{payment.reference_number}</TableCell>
                        <TableCell className="text-right font-medium text-emerald-600">
                          {formatCurrency(payment.amount_paid)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>No payments have been recorded yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
