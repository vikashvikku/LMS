"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Users, Loader2, Trash2, ShieldAlert } from "lucide-react";
import { createFeeStructureAction, updateFeeStructureAction, assignFeesToStudentsAction } from "@/actions/fees";
import { format } from "date-fns";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

function FeeStructureDialog({ programs, semesters, structureToEdit = null, open, onOpenChange }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [components, setComponents] = useState(structureToEdit?.components || [{ name: "Tuition Fee", amount: 0 }]);
  const [isActive, setIsActive] = useState(structureToEdit ? structureToEdit.is_active : true);

  const addComponent = () => {
    setComponents([...components, { name: "", amount: 0 }]);
  };

  const removeComponent = (idx) => {
    setComponents(components.filter((_, i) => i !== idx));
  };

  const updateComponent = (idx, field, value) => {
    const newComps = [...components];
    newComps[idx][field] = value;
    setComponents(newComps);
  };

  const total = components.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);
    formData.append("is_active", isActive.toString());
    formData.append("components", JSON.stringify(components));

    startTransition(async () => {
      let result;
      if (structureToEdit) {
        result = await updateFeeStructureAction(structureToEdit.id, formData);
      } else {
        result = await createFeeStructureAction(formData);
      }
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {structureToEdit ? (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onOpenChange(true)}>
          <Edit className="h-4 w-4 text-muted-foreground" />
        </Button>
      ) : (
        <Button className="gap-2" onClick={() => onOpenChange(true)}>
          <Plus className="h-4 w-4" /> Create Structure
        </Button>
      )}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{structureToEdit ? "Edit Fee Structure" : "Create Fee Structure"}</DialogTitle>
            <DialogDescription>
              Define the fee template to be assigned to students.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 text-sm text-destructive font-medium">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Structure Name <span className="text-red-500">*</span></Label>
                <Input name="name" defaultValue={structureToEdit?.name} placeholder="e.g. B.Tech CSE Sem 1 2026" required disabled={isPending} />
              </div>
              <div className="grid gap-2">
                <Label>Default Due Date</Label>
                <Input type="date" name="due_date" defaultValue={structureToEdit?.due_date} disabled={isPending} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Academic Program <span className="text-red-500">*</span></Label>
                <Select name="program_id" defaultValue={structureToEdit?.program?.id} required disabled={isPending || !!structureToEdit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Semester <span className="text-red-500">*</span></Label>
                <Select name="semester_id" defaultValue={structureToEdit?.semester?.id} required disabled={isPending || !!structureToEdit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 bg-muted/20">
              <div className="flex justify-between items-center mb-4">
                <Label className="text-base font-semibold">Fee Components</Label>
                <Button type="button" variant="outline" size="sm" onClick={addComponent} disabled={isPending}>
                  <Plus className="h-3 w-3 mr-1" /> Add Component
                </Button>
              </div>
              
              <div className="space-y-3">
                {components.map((comp, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <Input 
                      placeholder="Component Name (e.g. Tuition Fee)" 
                      value={comp.name} 
                      onChange={(e) => updateComponent(idx, "name", e.target.value)}
                      required 
                      disabled={isPending}
                      className="flex-1"
                    />
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="Amount" 
                      value={comp.amount} 
                      onChange={(e) => updateComponent(idx, "amount", Number(e.target.value))}
                      required 
                      disabled={isPending}
                      className="w-32"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => removeComponent(idx)}
                      disabled={isPending || components.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Total Expected:</span>
                <span className="font-bold text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">Is this fee structure active and available?</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} disabled={isPending} />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Structure
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AssignFeesDialog({ structure, programs, semesters, open, onOpenChange }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.target);
    formData.append("fee_structure_id", structure.id);
    // target_type = 'all' implies all students in that program+semester

    startTransition(async () => {
      const result = await assignFeesToStudentsAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(`Successfully assigned fees to ${result.count} students!`);
        setTimeout(() => onOpenChange(false), 2000);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isPending) {
        onOpenChange(val);
        if (!val) {
          setError(null);
          setSuccess(null);
        }
      }
    }}>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => onOpenChange(true)}>
        <Users className="h-4 w-4" /> Assign Fees
      </Button>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Fees to Students</DialogTitle>
            <DialogDescription>
              Assign the <strong>{structure.name}</strong> ({formatCurrency(structure.base_amount)}) to eligible students.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {error && <div className="p-3 bg-destructive/15 text-destructive rounded-md text-sm">{error}</div>}
            {success && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-md text-sm font-medium">{success}</div>}

            <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Program:</span>
                <span className="font-medium">{structure.program?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Semester:</span>
                <span className="font-medium">{structure.semester?.name}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm flex gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <p>
                This action will find all active students enrolled in this exact Program and Semester combination, and assign this fee structure to them. 
                Students who already have this fee assigned will be safely skipped.
              </p>
            </div>

            {/* Hidden inputs to pass data */}
            <input type="hidden" name="target_type" value="all" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending || success}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign to Eligible Students
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export function ClientFeeStructures({ initialData, programs, semesters }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpenId, setEditOpenId] = useState(null);
  const [assignOpenId, setAssignOpenId] = useState(null);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
        <CardTitle>Configured Fee Structures</CardTitle>
        <FeeStructureDialog 
          programs={programs} 
          semesters={semesters} 
          open={createOpen} 
          onOpenChange={setCreateOpen} 
        />
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>NAME</TableHead>
              <TableHead>PROGRAM</TableHead>
              <TableHead>SEMESTER</TableHead>
              <TableHead>TOTAL AMOUNT</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length > 0 ? (
              initialData.map((struct) => (
                <TableRow key={struct.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{struct.name}</span>
                      <span className="text-xs text-muted-foreground">Due: {struct.due_date ? format(new Date(struct.due_date), "dd MMM yyyy") : "No due date"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{struct.program?.code}</TableCell>
                  <TableCell>{struct.semester?.name}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(struct.base_amount)}</TableCell>
                  <TableCell>
                    <Badge variant={struct.is_active ? "outline" : "secondary"} className={struct.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}>
                      {struct.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <AssignFeesDialog 
                        structure={struct} 
                        programs={programs} 
                        semesters={semesters}
                        open={assignOpenId === struct.id}
                        onOpenChange={(val) => setAssignOpenId(val ? struct.id : null)}
                      />
                      <FeeStructureDialog 
                        programs={programs} 
                        semesters={semesters} 
                        structureToEdit={struct}
                        open={editOpenId === struct.id}
                        onOpenChange={(val) => setEditOpenId(val ? struct.id : null)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No fee structures defined yet. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
