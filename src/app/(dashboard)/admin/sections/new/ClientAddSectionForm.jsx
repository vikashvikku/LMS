"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Loader2 } from "lucide-react";
import { createSectionAction } from "@/actions/sections";

export function ClientAddSectionForm({ programs, courses, semesters }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  
  const [selectedProgram, setSelectedProgram] = useState("");
  const [isActive, setIsActive] = useState(true);

  const filteredCourses = selectedProgram 
    ? courses.filter(c => c.program_id === selectedProgram)
    : courses;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.target);
    formData.append("is_active", isActive.toString());

    startTransition(async () => {
      const result = await createSectionAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/admin/sections");
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
          <Label>Academic Program <span className="text-red-500">*</span></Label>
          <Select 
            value={selectedProgram} 
            onValueChange={(val) => {
              setSelectedProgram(val);
              // Reset course if using uncontrolled inputs, but we use native form so it's fine
            }} 
            required 
            disabled={isPending}
          >
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

        <div className="grid gap-2">
          <Label htmlFor="subject_id">Course / Subject <span className="text-red-500">*</span></Label>
          <Select name="subject_id" required disabled={isPending || !selectedProgram}>
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title} ({course.code})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No courses available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Section Name <span className="text-red-500">*</span></Label>
          <Input 
            id="name" 
            name="name" 
            placeholder="e.g. CSE-A" 
            required 
            disabled={isPending}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="code">Section Code <span className="text-muted-foreground font-normal">(Optional)</span></Label>
          <Input 
            id="code" 
            name="code" 
            placeholder="e.g. SEC-CSE-A-2026" 
            disabled={isPending}
            className="uppercase"
            onChange={(e) => e.target.value = e.target.value.toUpperCase()}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="semester_id">Academic Period / Semester <span className="text-red-500">*</span></Label>
          <Select name="semester_id" required disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map(sem => (
                <SelectItem key={sem.id} value={sem.id}>
                  {sem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="capacity">Maximum Capacity <span className="text-red-500">*</span></Label>
          <Input 
            id="capacity" 
            name="capacity" 
            type="number"
            min="1"
            max="1000"
            placeholder="e.g. 60" 
            defaultValue="60"
            required 
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Section Status</Label>
          <p className="text-sm text-muted-foreground">
            {isActive 
              ? "This section is active and visible." 
              : "This section is inactive."}
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
          onClick={() => router.push("/admin/sections")}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Section...
            </>
          ) : (
            "Create Section"
          )}
        </Button>
      </div>
    </form>
  );
}
