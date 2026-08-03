"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Banknote, Loader2, Calendar } from "lucide-react";
import { recordPaymentAction } from "@/actions/fees";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export function ClientRecordPaymentDialog({ fee }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);
    formData.append("student_fee_id", fee.id);

    startTransition(async () => {
      const result = await recordPaymentAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setOpen(false);
      }
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 font-medium bg-emerald-600 hover:bg-emerald-700 text-white">
          <Banknote className="h-4 w-4" /> Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {fee.student?.first_name} {fee.student?.last_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 text-sm text-destructive font-medium">
                {error}
              </div>
            )}

            <div className="p-3 border border-border bg-muted/30 rounded-lg flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Outstanding Balance:</span>
              <span className="font-bold text-lg text-amber-600">{formatCurrency(fee.balance)}</span>
            </div>

            <div className="grid gap-2">
              <Label>Amount Paid (₹) <span className="text-red-500">*</span></Label>
              <Input 
                type="number" 
                name="amount_paid" 
                required 
                min="1" 
                max={fee.balance}
                step="0.01"
                defaultValue={fee.balance}
                disabled={isPending} 
              />
              <p className="text-xs text-muted-foreground">Cannot exceed the outstanding balance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Payment Method <span className="text-red-500">*</span></Label>
                <Select name="payment_method" defaultValue="cash" required disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Payment Date <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input 
                    type="date" 
                    name="payment_date" 
                    required 
                    defaultValue={todayStr}
                    max={todayStr}
                    disabled={isPending} 
                    className="pl-9"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Transaction / Reference ID</Label>
              <Input 
                name="reference_number" 
                placeholder="e.g. UTR Number, Cheque No." 
                disabled={isPending} 
              />
              <p className="text-xs text-muted-foreground">Leave blank to auto-generate a receipt number.</p>
            </div>
            
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea 
                name="notes" 
                placeholder="Any additional information..." 
                disabled={isPending}
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
