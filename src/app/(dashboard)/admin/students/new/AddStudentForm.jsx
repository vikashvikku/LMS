"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStudentAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function AddStudentForm({ programsWithSections }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Minimal client state to filter sections based on program selection
  const [selectedProgram, setSelectedProgram] = useState("");
  
  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value);
  };

  const availableSections = (() => {
    if (!selectedProgram) return [];
    const program = programsWithSections.find(p => p.id === selectedProgram);
    if (!program) return [];
    
    // Group all sections by their name (e.g., "CSE-A")
    const grouped = {};
    program.courses.forEach(c => {
      c.subjects.forEach(s => {
        s.sections.forEach(sec => {
          if (!grouped[sec.name]) {
            grouped[sec.name] = {
              name: sec.name,
              ids: [],
              courseCode: c.code,
              courseTitle: c.title
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
    setSuccess(false);
    
    const formData = new FormData(e.target);
    
    startTransition(async () => {
      const result = await createStudentAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/admin/students/${result.studentId}`);
        }, 1500);
      }
    });
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900 shadow-sm max-w-2xl">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-300">Student Account Created</h3>
          <p className="text-sm text-green-700 dark:text-green-400 mt-2">
            An invitation email has been sent. The student will be redirected to their profile shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border max-w-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
          <CardDescription>
            This will create a new student profile and send an invitation email to set their password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 rounded-md bg-destructive/15 border border-destructive/30 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
              <Input id="firstName" name="firstName" required placeholder="Jane" disabled={isPending} />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
              <Input id="lastName" name="lastName" required placeholder="Doe" disabled={isPending} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
            <Input id="email" name="email" type="email" required placeholder="jane.doe@university.edu" disabled={isPending} />
            <p className="text-xs text-muted-foreground">The invitation link will be sent here.</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground">Initial Enrollment</h4>
            
            <div className="space-y-2">
              <label htmlFor="programId" className="text-sm font-medium text-muted-foreground">Academic Program</label>
              <select 
                id="programId"
                name="programId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                value={selectedProgram}
                onChange={handleProgramChange}
                disabled={isPending}
              >
                <option value="">Select a Program...</option>
                {programsWithSections.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="sectionId" className="text-sm font-medium text-muted-foreground">Section Assignment</label>
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
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 px-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Student Account
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
