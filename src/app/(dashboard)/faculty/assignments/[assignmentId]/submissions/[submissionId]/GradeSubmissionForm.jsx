"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, Lock, Globe } from "lucide-react";
import { gradeSubmissionAction } from "@/actions/faculty";
import Link from "next/link";

export function GradeSubmissionForm({ assignmentId, submissionId, maxMarks, initialGrade = null }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    setIsPending(true);
    setError("");
    setSuccess(false);
    
    formData.append("assignmentId", assignmentId);
    formData.append("submissionId", submissionId);
    
    const result = await gradeSubmissionAction(formData);
    
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    
    setIsPending(false);
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-200 flex items-center gap-2">
          <Check className="h-4 w-4" />
          Grade saved successfully.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="marks" className="flex items-center justify-between">
          <span>Marks Awarded</span>
          <span className="text-muted-foreground font-normal">Max: {maxMarks}</span>
        </Label>
        <div className="relative">
          <Input 
            id="marks" 
            name="marks" 
            type="number" 
            min="0" 
            max={maxMarks}
            step="0.1"
            className="pr-12 text-lg font-semibold"
            defaultValue={initialGrade?.marks_obtained}
            required 
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground/80">
            / {maxMarks}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback (Optional)</Label>
        <Textarea 
          id="feedback" 
          name="feedback" 
          placeholder="Provide constructive feedback to the student..."
          className="min-h-[120px]"
          defaultValue={initialGrade?.feedback || ""}
        />
      </div>

      <div className="flex items-center space-x-2 bg-muted p-3 rounded-lg border">
        <input 
          type="checkbox" 
          id="isReleased" 
          name="isReleased" 
          className="h-4 w-4 rounded border-slate-300 text-foreground focus:ring-slate-950"
          defaultChecked={initialGrade ? initialGrade.is_released : false}
        />
        <Label htmlFor="isReleased" className="font-medium cursor-pointer flex flex-col">
          <span className="flex items-center gap-1.5 text-foreground">
            <Globe className="h-3.5 w-3.5" />
            Release grade to student
          </span>
          <span className="text-muted-foreground font-normal text-xs mt-0.5">
            If unchecked, the grade remains hidden (draft).
          </span>
        </Label>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialGrade ? "Update Grade" : "Save Grade"}
        </Button>
      </div>
    </form>
  );
}
