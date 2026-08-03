"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Plus, UserPlus } from "lucide-react";
import { assignStudentToSectionAction } from "@/actions/sections";

export function ClientAssignStudentDialog({ sectionId, eligibleStudents, isFull }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setError(null);
    
    startTransition(async () => {
      const result = await assignStudentToSectionAction(sectionId, selectedStudent);
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
          setSelectedStudent("");
        }
      }
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" disabled={isFull}>
          <UserPlus className="h-4 w-4" />
          Assign Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Student</DialogTitle>
            <DialogDescription>
              Select an eligible student from the same academic program to enroll in this section.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 flex items-start gap-2 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label>Select Student <span className="text-red-500">*</span></Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent} required disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Search and select student..." />
                </SelectTrigger>
                <SelectContent>
                  {eligibleStudents.length > 0 ? (
                    eligibleStudents.map(stu => (
                      <SelectItem key={stu.id} value={stu.id}>
                        {stu.first_name} {stu.last_name} ({stu.id?.split('-')[0].toUpperCase()})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No eligible students found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !selectedStudent}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Student"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
