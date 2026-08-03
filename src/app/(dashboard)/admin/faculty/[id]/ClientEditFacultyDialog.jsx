"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateFacultyAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Edit, AlertCircle } from "lucide-react";

export function ClientEditFacultyDialog({ faculty, departments }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const facProfile = faculty.faculty_profiles?.[0] || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.target);
    
    startTransition(async () => {
      const result = await updateFacultyAction(faculty.id, formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isPending) {
        setOpen(val);
        if (!val) setError(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Faculty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Faculty Profile</DialogTitle>
            <DialogDescription>
              Update personal and academic details for this faculty member.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 flex items-start gap-2 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">First Name *</label>
                <Input id="firstName" name="firstName" required defaultValue={faculty.first_name} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">Last Name *</label>
                <Input id="lastName" name="lastName" required defaultValue={faculty.last_name} disabled={isPending} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="employeeId" className="text-sm font-medium text-muted-foreground">Employee ID</label>
                <Input id="employeeId" name="employeeId" defaultValue={facProfile.employee_id || ''} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <label htmlFor="joiningDate" className="text-sm font-medium text-muted-foreground">Date of Joining</label>
                <Input id="joiningDate" name="joiningDate" type="date" defaultValue={facProfile.joining_date || ''} disabled={isPending} />
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
                  defaultValue={facProfile.department_id || ''}
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
                  defaultValue={facProfile.designation || ''}
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
              <Input id="specialization" name="specialization" defaultValue={facProfile.specialization || ''} disabled={isPending} />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <Input id="phone" name="phone" defaultValue={facProfile.phone || ''} disabled={isPending} />
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
