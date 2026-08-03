"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Loader2, Edit } from "lucide-react";
import { updateProgramAction } from "@/actions/programs";

const PROGRAM_TYPES = [
  "Undergraduate",
  "Postgraduate",
  "Diploma",
  "Certificate",
  "Doctoral"
];

const DURATION_UNITS = [
  "Years",
  "Months",
  "Weeks",
  "Semesters"
];

export function ClientEditProgramDialog({ program, departments }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  
  const [isActive, setIsActive] = useState(program.is_active);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.target);
    formData.append("is_active", isActive.toString());

    startTransition(async () => {
      const result = await updateProgramAction(program.id, formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isPending) {
        setOpen(val);
        if (!val) {
          setError(null);
          setIsActive(program.is_active);
        }
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Program
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogDescription>
              Update the information for this academic program.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 flex items-start gap-2 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Program Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={program.name}
                  required 
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code">Program Code <span className="text-red-500">*</span></Label>
                <Input 
                  id="code" 
                  name="code" 
                  defaultValue={program.code}
                  required 
                  disabled={isPending}
                  className="uppercase"
                  onChange={(e) => e.target.value = e.target.value.toUpperCase()}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="type">Program Type <span className="text-red-500">*</span></Label>
                <Select name="type" defaultValue={program.type || "Undergraduate"} required disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="department_id">Department <span className="text-red-500">*</span></Label>
                <Select name="department_id" defaultValue={program.departments?.id} required disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration <span className="text-red-500">*</span></Label>
                <Input 
                  id="duration" 
                  name="duration" 
                  type="number"
                  min="1"
                  defaultValue={program.duration || 4}
                  required 
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration_unit">Duration Unit <span className="text-red-500">*</span></Label>
                <Select name="duration_unit" defaultValue={program.duration_unit || "Years"} required disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_UNITS.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={program.description || ""}
                className="min-h-[100px]"
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-base">Program Status</Label>
                <p className="text-sm text-muted-foreground">
                  {isActive 
                    ? "This program is active and visible." 
                    : "This program is inactive and hidden."}
                </p>
              </div>
              <Switch 
                checked={isActive} 
                onCheckedChange={setIsActive} 
                disabled={isPending}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
