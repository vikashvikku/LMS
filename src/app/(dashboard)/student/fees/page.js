import { getStudentFees } from "@/lib/data/student";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Clock, Receipt, IndianRupee, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function StudentFees() {
  const fees = await getStudentFees();

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Fees & Payments</h1>
        <p className="text-muted-foreground mt-1">Manage your university tuition and other fees.</p>
      </div>

      {fees.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-border/60">
          <div className="bg-muted p-4 rounded-full mb-4">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">All Cleared!</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            You do not have any pending fee structures assigned to you at the moment.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {fees.map((fee) => {
            const structure = fee.fee_structures;
            // Compute amount paid from payments array
            const totalPaid = (fee.payments || []).reduce((sum, p) => sum + Number(p.amount_paid), 0);
            const netAmount = Number(fee.total_amount) - Number(fee.discount_amount);
            const outstanding = netAmount - totalPaid;
            const dueDate = new Date(fee.due_date);
            const isOverdue = dueDate < new Date() && outstanding > 0;
            const isPaid = outstanding <= 0;

            return (
              <Card key={fee.id} className="border-border/60 hover:shadow-md transition-shadow overflow-hidden">
                <CardHeader className="bg-secondary/20 border-b pb-5">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${isPaid ? 'bg-success/10 text-success' : isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">{structure?.name || 'Fee Structure'}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <span className="font-medium text-foreground">{fee.academic_years?.name || 'Current Year'}</span>
                          <span>•</span>
                          <span>Due: {formatDate(dueDate)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    {isPaid ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 px-3 py-1 text-sm font-medium">Paid in Full</Badge>
                    ) : isOverdue ? (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 text-sm font-medium">Overdue</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 px-3 py-1 text-sm font-medium">Payment Pending</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <div className="flex flex-col gap-1 p-4 rounded-xl bg-secondary/20 border border-border/50">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <IndianRupee className="h-3.5 w-3.5" />
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(netAmount)}</p>
                      {Number(fee.discount_amount) > 0 && (
                        <p className="text-xs font-medium text-success mt-1">Includes {formatCurrency(Number(fee.discount_amount))} discount</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1 p-4 rounded-xl bg-success/5 border border-success/10">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        Amount Paid
                      </p>
                      <p className="text-2xl font-bold text-success mt-1">{formatCurrency(totalPaid)}</p>
                    </div>
                    
                    <div className={`flex flex-col gap-1 p-4 rounded-xl border ${outstanding > 0 ? (isOverdue ? 'bg-destructive/5 border-destructive/10' : 'bg-warning/5 border-warning/10') : 'bg-secondary/20 border-border/50'}`}>
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        {outstanding > 0 && isOverdue ? <AlertCircle className="h-3.5 w-3.5 text-destructive" /> : null}
                        Outstanding Balance
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${outstanding > 0 ? (isOverdue ? 'text-destructive' : 'text-warning') : 'text-foreground'}`}>
                        {outstanding > 0 ? formatCurrency(outstanding) : formatCurrency(0)}
                      </p>
                    </div>
                  </div>

                  {fee.payments && fee.payments.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Recent Transactions
                      </h4>
                      <div className="border border-border/60 rounded-xl overflow-hidden bg-card">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30 border-b border-border/60">
                            <tr>
                              <th className="text-left font-medium text-muted-foreground p-4">Date</th>
                              <th className="text-left font-medium text-muted-foreground p-4">Method</th>
                              <th className="text-right font-medium text-muted-foreground p-4">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {fee.payments.map((payment, i) => (
                              <tr key={i} className="hover:bg-muted/30 transition-colors">
                                <td className="p-4 font-medium">{formatDate(payment.paid_at)}</td>
                                <td className="p-4 capitalize text-muted-foreground">
                                  {payment.payment_method || 'N/A'}
                                </td>
                                <td className="p-4 text-right font-bold text-foreground">
                                  {formatCurrency(Number(payment.amount_paid))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border/60 rounded-xl bg-muted/10">
                      <p className="text-sm text-muted-foreground">No payments have been made yet.</p>
                    </div>
                  )}
                </CardContent>
                
                {!isPaid && (
                  <CardFooter className="bg-secondary/20 border-t border-border/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      Please pay the outstanding balance before the due date.
                    </div>
                    <Button disabled className="w-full sm:w-auto">
                      Pay {formatCurrency(outstanding)}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
