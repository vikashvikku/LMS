"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Edit, AlertCircle } from "lucide-react";
import { updateStudentAcademicAssignmentAction } from "@/actions/admin";

export function ClientEditAssignmentDialog({ studentId, programsWithSections }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  
  const [selectedProgram, setSelectedProgram] = useState("");

  // Group sections by name exactly like AddStudentForm
  const availableSections = (() => {
    if (!selectedProgram) return [];
    const program = programsWithSections.find(p => p.id === selectedProgram);
    if (!program) return [];
    
    const grouped = {};
    program.courses.forEach(c => {
      c.subjects.forEach(s => {
        s.sections.forEach(sec => {
          if (!grouped[sec.name]) {
            grouped[sec.name] = {
              name: sec.name,
              ids: [],
            };
          }
          grouped[sec.name].ids.push(sec.id);
        });
      });
    });
    
    return Object.values(grouped);
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.target);
    const programId = formData.get("programId");
    const sectionIdsStr = formData.get("sectionId");
    
    if (!programId || !sectionIdsStr) {
      setError("Please select both a program and a section.");
      return;
    }

    startTransition(async () => {
      const result = await updateStudentAcademicAssignmentAction(studentId, programId, sectionIdsStr);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setOpen(false);
        setSelectedProgram(""); // reset form
        router.refresh(); // Refresh the page to reflect changes
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isPending) {
        setOpen(val);
        if (!val) {
          setError(null);
          setSelectedProgram("");
        }
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Academic Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Academic Assignment</DialogTitle>
            <DialogDescription>
              Assign the student to a new academic program and section. This will withdraw them from their current active enrollments and create new ones.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 flex items-start gap-2 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="grid gap-2">
              <label htmlFor="programId" className="text-sm font-medium">Academic Program</label>
              <select 
                id="programId"
                name="programId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                disabled={isPending}
              >
                <option value="">Select a Program...</option>
                {programsWithSections.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="sectionId" className="text-sm font-medium">Section</label>
              <select 
                id="sectionId"
                name="sectionId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={!selectedProgram || isPending}
              >
                {!selectedProgram ? (
                  <option value="">Select a program first</option>
                ) : (
                  <option value="">Select a Section...</option>
                )}
                {availableSections.map(sec => (
                  <option key={sec.name} value={sec.ids.join(',')}>
                    {sec.name}
                  </option>
                ))}
              </select>
              {selectedProgram && availableSections.length === 0 && (
                <p className="text-xs text-amber-600">No active sections available for this program.</p>
              )}
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
