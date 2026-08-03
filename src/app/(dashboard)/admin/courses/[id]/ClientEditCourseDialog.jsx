"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Loader2, Edit } from "lucide-react";
import { updateCourseAction } from "@/actions/courses";

const COURSE_TYPES = [
  "Core",
  "Elective",
  "Lab"
];

export function ClientEditCourseDialog({ course, programs }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  
  const [isActive, setIsActive] = useState(course.is_active);
  const [selectedProgram, setSelectedProgram] = useState(course.program?.id);

  // Auto-determine max semesters based on program duration
  let maxSemesters = 8;
  if (selectedProgram) {
    const prog = programs.find(p => p.id === selectedProgram);
    if (prog) {
      if (prog.duration_unit === 'Years') maxSemesters = prog.duration * 2;
      else if (prog.duration_unit === 'Semesters') maxSemesters = prog.duration;
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.target);
    formData.append("is_active", isActive.toString());
    formData.append("program_id", selectedProgram);

    startTransition(async () => {
      const result = await updateCourseAction(course.id, formData);
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
          setIsActive(course.is_active);
          setSelectedProgram(course.program?.id);
        }
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the academic properties of this course.
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
              <Label>Academic Program <span className="text-red-500">*</span></Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram} required disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map(prog => (
                    <SelectItem key={prog.id} value={prog.id}>
                      {prog.name} ({prog.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="title">Course Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  name="title" 
                  defaultValue={course.title}
                  required 
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code">Course Code <span className="text-red-500">*</span></Label>
                <Input 
                  id="code" 
                  name="code" 
                  defaultValue={course.code}
                  required 
                  disabled={isPending}
                  className="uppercase"
                  onChange={(e) => e.target.value = e.target.value.toUpperCase()}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="semester">Semester <span className="text-red-500">*</span></Label>
                <Select name="semester" defaultValue={course.semester?.toString() || "1"} required disabled={isPending || !selectedProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxSemesters }).map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Semester {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="credits">Credits <span className="text-red-500">*</span></Label>
                <Input 
                  id="credits" 
                  name="credits" 
                  type="number"
                  min="1"
                  max="10"
                  defaultValue={course.credits || 3}
                  required 
                  disabled={isPending}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Course Type <span className="text-red-500">*</span></Label>
                <Select name="type" defaultValue={course.type || "Core"} required disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-base">Course Status</Label>
                <p className="text-sm text-muted-foreground">
                  {isActive 
                    ? "This course is active." 
                    : "This course is inactive."}
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
