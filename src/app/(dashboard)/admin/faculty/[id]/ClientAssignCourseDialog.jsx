"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFacultyAssignmentAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, AlertCircle } from "lucide-react";

export function ClientAssignCourseDialog({ facultyId, programs }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  
  const [selectedProgram, setSelectedProgram] = useState("");

  const availableSubjects = (() => {
    if (!selectedProgram) return [];
    const program = programs.find(p => p.id === selectedProgram);
    if (!program) return [];
    return program.subjects || [];
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.target);
    const programId = formData.get("programId");
    const subjectId = formData.get("courseId"); // Frontend calls it courseId but it holds subjectId
    
    if (!programId || !subjectId) {
      setError("Please select both an academic program and a course.");
      return;
    }

    startTransition(async () => {
      const result = await createFacultyAssignmentAction(facultyId, formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setOpen(false);
        setSelectedProgram(""); // reset form
        router.refresh();
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
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Assign Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Course</DialogTitle>
            <DialogDescription>
              Assign the faculty member to a specific course.
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
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="courseId" className="text-sm font-medium">Course</label>
              <select 
                id="courseId"
                name="courseId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={!selectedProgram || isPending}
              >
                {!selectedProgram ? (
                  <option value="">Select a program first</option>
                ) : (
                  <option value="">Select a Course...</option>
                )}
                {availableSubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.title}
                  </option>
                ))}
              </select>
              {selectedProgram && availableSubjects.length === 0 && (
                <p className="text-xs text-amber-600">No courses available for this program.</p>
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
                  Assigning...
                </>
              ) : (
                "Assign Course"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
