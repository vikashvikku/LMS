"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, Clock, Settings, FileText } from "lucide-react";
import { createAssignmentAction, updateAssignmentAction } from "@/actions/faculty";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function AssignmentForm({ initialData = null, availableSections = [] }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  
  // Track selected subject to filter sections
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    initialData?.sections?.subjects?.id || ""
  );
  
  const isEditing = !!initialData;
  const action = isEditing ? updateAssignmentAction : createAssignmentAction;

  const handleSubmit = async (formData) => {
    setIsPending(true);
    setError("");
    
    // Add assignmentId if editing
    if (isEditing) {
      formData.append("assignmentId", initialData.id);
    }
    
    const result = await action(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
    // Success triggers a redirect inside the action
  };

  // Extract just the date and time strings for the datetime-local input
  const defaultDueDate = initialData?.due_date 
    ? new Date(initialData.due_date).toISOString().slice(0, 16)
    : "";

  // Derive unique subjects from available faculty assignments
  const uniqueSubjects = Array.from(
    new Map(
      availableSections
        .filter(fa => fa.sections?.subjects)
        .map(fa => [fa.sections.subjects.id, fa.sections.subjects])
    ).values()
  );

  // Filter sections based on selected subject
  const filteredAssignments = selectedSubjectId
    ? availableSections.filter(fa => fa.sections?.subjects?.id === selectedSubjectId)
    : [];

  // Deduplicate sections for the selected subject using the actual primary key sections.id
  const uniqueSections = Array.from(
    new Map(
      filteredAssignments
        .filter(fa => fa.sections?.id)
        .map(fa => [fa.sections.id, fa.sections])
    ).values()
  );

  return (
    <Card className="max-w-3xl mx-auto shadow-sm border-border/60">
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle className="text-xl flex items-center gap-2">
          {isEditing ? <Settings className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
          {isEditing ? "Edit Assignment" : "Create New Assignment"}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? "Update the details and schedule for this assignment."
            : "Configure a new assignment for your students."}
        </CardDescription>
      </CardHeader>
      
      <form action={handleSubmit}>
        <CardContent className="p-6 space-y-8">
          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 font-medium flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20">!</span>
              {error}
            </div>
          )}

          {/* Section 1: Course Context */}
          {!isEditing && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
                <BookOpen className="h-4 w-4" />
                <h3>Course Context</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="space-y-2">
                  <Label htmlFor="subjectId">Course / Subject</Label>
                  <Select 
                    value={selectedSubjectId} 
                    onValueChange={setSelectedSubjectId}
                    required
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSubjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.title} ({subject.courses?.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sectionId">Section</Label>
                  <Select name="sectionId" required disabled={!selectedSubjectId}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select a section..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSections.map(section => (
                        <SelectItem key={section.id} value={section.id}>
                          Section {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Assignment Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
              <FileText className="h-4 w-4" />
              <h3>Assignment Details</h3>
            </div>
            <div className="space-y-4 p-4 rounded-lg border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">Assignment Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="e.g. Midterm Essay: Database Normalization" 
                  defaultValue={initialData?.title}
                  className="bg-background"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Instructions & Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Provide detailed instructions, formatting requirements, and resources for the students..."
                  className="min-h-[160px] resize-y bg-background"
                  defaultValue={initialData?.description || ""}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Schedule & Evaluation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
              <Clock className="h-4 w-4" />
              <h3>Schedule & Evaluation</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-lg border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-foreground">Due Date & Time</Label>
                <Input 
                  id="dueDate" 
                  name="dueDate" 
                  type="datetime-local" 
                  defaultValue={defaultDueDate}
                  className="bg-background"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxMarks" className="text-foreground">Maximum Marks</Label>
                <Input 
                  id="maxMarks" 
                  name="maxMarks" 
                  type="number" 
                  min="1" 
                  step="0.5"
                  defaultValue={initialData?.max_marks || 100}
                  className="bg-background"
                  required 
                />
              </div>
            </div>
          </div>

          {/* Section 4: Publishing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
              <Settings className="h-4 w-4" />
              <h3>Publishing</h3>
            </div>
            <div className="p-4 rounded-lg border border-border/50 bg-secondary/20">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="flex items-center h-5 mt-0.5">
                  <input 
                    type="checkbox" 
                    id="isPublished" 
                    name="isPublished" 
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary transition-colors cursor-pointer"
                    defaultChecked={initialData?.is_published}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">Publish immediately</span>
                  <span className="text-sm text-muted-foreground">Students will receive a notification and be able to see this assignment immediately upon saving.</span>
                </div>
              </label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 bg-muted/30 border-t flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            asChild
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            <Link href={isEditing ? `/faculty/assignments/${initialData.id}` : "/faculty/assignments"}>
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto min-w-[140px]">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? "Save Changes" : "Create Assignment"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
