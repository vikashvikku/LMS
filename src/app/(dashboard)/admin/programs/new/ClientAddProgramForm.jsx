"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Loader2 } from "lucide-react";
import { createProgramAction } from "@/actions/programs";

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

export function ClientAddProgramForm({ departments }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.target);
    formData.append("is_active", isActive.toString());

    startTransition(async () => {
      const result = await createProgramAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/admin/programs");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="e.g. Bachelor of Technology in CSE" 
            required 
            disabled={isPending}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="code">Program Code <span className="text-red-500">*</span></Label>
          <Input 
            id="code" 
            name="code" 
            placeholder="e.g. BTECH-CSE" 
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
          <Select name="type" defaultValue="Undergraduate" required disabled={isPending}>
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
          <Select name="department_id" required disabled={isPending}>
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
            placeholder="e.g. 4" 
            defaultValue="4"
            required 
            disabled={isPending}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="duration_unit">Duration Unit <span className="text-red-500">*</span></Label>
          <Select name="duration_unit" defaultValue="Years" required disabled={isPending}>
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
          placeholder="Brief description of the program (optional)" 
          className="min-h-[100px]"
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Program Status</Label>
          <p className="text-sm text-muted-foreground">
            {isActive 
              ? "This program is active and visible to students and faculty." 
              : "This program is inactive and hidden from normal operations."}
          </p>
        </div>
        <Switch 
          checked={isActive} 
          onCheckedChange={setIsActive} 
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-border">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push("/admin/programs")}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Program...
            </>
          ) : (
            "Create Program"
          )}
        </Button>
      </div>
    </form>
  );
}
