"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFacultyAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function AddFacultyForm({ departments }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    const formData = new FormData(e.target);
    
    startTransition(async () => {
      const result = await createFacultyAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/admin/faculty/${result.facultyId}`);
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
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-300">Faculty Account Created</h3>
          <p className="text-sm text-green-700 dark:text-green-400 mt-2">
            An invitation email has been sent. You will be redirected to their profile shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border max-w-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Add New Faculty</CardTitle>
          <CardDescription>
            This will create a new faculty profile and send an invitation email to set their password.
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
              <label htmlFor="firstName" className="text-sm font-medium">First Name *</label>
              <Input id="firstName" name="firstName" required placeholder="John" disabled={isPending} />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">Last Name *</label>
              <Input id="lastName" name="lastName" required placeholder="Smith" disabled={isPending} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email Address *</label>
            <Input id="email" name="email" type="email" required placeholder="john.smith@university.edu" disabled={isPending} />
            <p className="text-xs text-muted-foreground">The invitation link will be sent here.</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground">Faculty Details</h4>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="employeeId" className="text-sm font-medium text-muted-foreground">Employee ID</label>
                <Input id="employeeId" name="employeeId" placeholder="FAC-2023-01" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <label htmlFor="joiningDate" className="text-sm font-medium text-muted-foreground">Date of Joining</label>
                <Input id="joiningDate" name="joiningDate" type="date" disabled={isPending} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="departmentId" className="text-sm font-medium text-muted-foreground">Department</label>
                <select 
                  id="departmentId"
                  name="departmentId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isPending}
                >
                  <option value="">Select a Department...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="designation" className="text-sm font-medium text-muted-foreground">Designation</label>
                <select 
                  id="designation"
                  name="designation"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isPending}
                >
                  <option value="">Select Designation...</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Guest Faculty">Guest Faculty</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="specialization" className="text-sm font-medium text-muted-foreground">Specialization</label>
              <Input id="specialization" name="specialization" placeholder="e.g., Artificial Intelligence, Cloud Computing" disabled={isPending} />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <Input id="phone" name="phone" placeholder="+1 (555) 000-0000" disabled={isPending} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 px-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Faculty Account
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
