"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Loader2, Edit } from "lucide-react";
import { updateSectionAction } from "@/actions/sections";

export function ClientEditSectionDialog({ section }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  
  const [isActive, setIsActive] = useState(section.is_active);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.target);
    formData.append("is_active", isActive.toString());

    startTransition(async () => {
      const result = await updateSectionAction(section.id, formData);
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
          setIsActive(section.is_active);
        }
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Section
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update capacity or rename this section. Course and Semester cannot be modified to preserve historical enrollments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 flex items-start gap-2 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Section Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={section.name}
                  required 
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code">Section Code</Label>
                <Input 
                  id="code" 
                  name="code" 
                  defaultValue={section.code || ''}
                  disabled={isPending}
                  className="uppercase"
                  onChange={(e) => e.target.value = e.target.value.toUpperCase()}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Maximum Capacity <span className="text-red-500">*</span></Label>
              <Input 
                id="capacity" 
                name="capacity" 
                type="number"
                min={section.stats.studentsCount > 0 ? section.stats.studentsCount : 1}
                defaultValue={section.capacity}
                required 
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">Cannot be lower than current active enrollments ({section.stats.studentsCount}).</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-base">Section Status</Label>
                <p className="text-sm text-muted-foreground">
                  {isActive 
                    ? "This section is active." 
                    : "This section is inactive."}
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
