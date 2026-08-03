"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Loader2 } from "lucide-react";
import { createCourseAction } from "@/actions/courses";

const COURSE_TYPES = [
  "Core",
  "Elective",
  "Lab"
];

export function ClientAddCourseForm({ programs }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState("");
  
  const [isActive, setIsActive] = useState(true);

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

    startTransition(async () => {
      const result = await createCourseAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/admin/courses");
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

      <div className="grid gap-2">
        <Label htmlFor="program_id">Academic Program <span className="text-red-500">*</span></Label>
        <Select name="program_id" onValueChange={setSelectedProgram} required disabled={isPending}>
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
            placeholder="e.g. Database Management Systems" 
            required 
            disabled={isPending}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="code">Course Code <span className="text-red-500">*</span></Label>
          <Input 
            id="code" 
            name="code" 
            placeholder="e.g. CSE-301" 
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
          <Select name="semester" required disabled={isPending || !selectedProgram}>
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
            placeholder="e.g. 4" 
            defaultValue="3"
            required 
            disabled={isPending}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="type">Course Type <span className="text-red-500">*</span></Label>
          <Select name="type" defaultValue="Core" required disabled={isPending}>
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

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Course Status</Label>
          <p className="text-sm text-muted-foreground">
            {isActive 
              ? "This course is active and visible to students and faculty." 
              : "This course is inactive."}
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
          onClick={() => router.push("/admin/courses")}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Course...
            </>
          ) : (
            "Create Course"
          )}
        </Button>
      </div>
    </form>
  );
}
