"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { createTimetableAction } from "@/actions/timetable";

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ClientAddScheduleDialog({ programs, courses, sections, rooms, allFaculty }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [isActive, setIsActive] = useState(true);

  const filteredCourses = selectedProgram 
    ? courses.filter(c => c.program_id === selectedProgram)
    : courses;

  const filteredSections = selectedCourse 
    ? sections.filter(s => s.subject_name === courses.find(c => c.id === selectedCourse)?.title)
    : sections;

  // Retrieve faculty assigned to the selected course
  const courseDetails = courses.find(c => c.id === selectedCourse);
  const assignedFaculty = courseDetails?.faculty || [];
  
  // Other active faculty not already assigned
  const assignedFacultyIds = new Set(assignedFaculty.map(f => f.id));
  const otherFaculty = (allFaculty || []).filter(f => !assignedFacultyIds.has(f.id));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.target);
    formData.append("is_active", isActive.toString());
    formData.append("course_id", selectedCourse); // Passing course_id to server action to link faculty

    startTransition(async () => {
      const result = await createTimetableAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setOpen(false);
        // Reset states
        setSelectedProgram("");
        setSelectedCourse("");
        setSelectedSection("");
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
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Schedule</DialogTitle>
            <DialogDescription>
              Schedule a class time for a specific section. Overlapping conflicts will be automatically detected and prevented.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 flex items-start gap-2 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Academic Program <span className="text-red-500">*</span></Label>
                <Select value={selectedProgram} onValueChange={(val) => {
                  setSelectedProgram(val);
                  setSelectedCourse("");
                  setSelectedSection("");
                }} required disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Course / Subject <span className="text-red-500">*</span></Label>
                <Select value={selectedCourse} onValueChange={(val) => {
                  setSelectedCourse(val);
                  setSelectedSection("");
                }} required disabled={isPending || !selectedProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.title} ({c.code})</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No courses available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Section <span className="text-red-500">*</span></Label>
                <Select name="section_id" value={selectedSection} onValueChange={setSelectedSection} required disabled={isPending || !selectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSections.length > 0 ? (
                      filteredSections.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name} {s.code ? `(${s.code})` : ''}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No sections available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Faculty <span className="text-red-500">*</span></Label>
                <Select name="faculty_id" required disabled={isPending || !selectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {(assignedFaculty.length > 0 || otherFaculty.length > 0) ? (
                      <>
                        {assignedFaculty.length > 0 && (
                          <div className="mb-2">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Assigned to this course
                            </div>
                            {assignedFaculty.map(f => (
                              <SelectItem key={f.id} value={f.id}>{f.first_name} {f.last_name}</SelectItem>
                            ))}
                          </div>
                        )}
                        
                        {otherFaculty.length > 0 && (
                          <div>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-t border-border mt-1 pt-2">
                              {assignedFaculty.length > 0 ? "Other Active Faculty" : "Available Faculty"}
                            </div>
                            {otherFaculty.map(f => (
                              <SelectItem key={f.id} value={f.id}>{f.first_name} {f.last_name}</SelectItem>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground italic text-center">
                        No faculty available in your organization. Add faculty members first.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Room <span className="text-red-500">*</span></Label>
                <Select name="room_id" required disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.length > 0 ? (
                      rooms.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name} ({r.capacity} cap)</SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground italic text-center">
                        No rooms available. Add rooms before scheduling a class.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Class Type</Label>
                <Select name="class_type" defaultValue="Lecture" disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lecture">Lecture</SelectItem>
                    <SelectItem value="Lab">Lab</SelectItem>
                    <SelectItem value="Tutorial">Tutorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Day of Week <span className="text-red-500">*</span></Label>
                <Select name="day_of_week" required disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6].map(d => (
                      <SelectItem key={d} value={d.toString()}>{DAYS_OF_WEEK[d]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Start Time <span className="text-red-500">*</span></Label>
                <Input type="time" name="start_time" required disabled={isPending} />
              </div>

              <div className="grid gap-2">
                <Label>End Time <span className="text-red-500">*</span></Label>
                <Input type="time" name="end_time" required disabled={isPending} />
              </div>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-base">Status</Label>
                <p className="text-sm text-muted-foreground">Is this schedule currently active?</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} disabled={isPending} />
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
                "Save Schedule"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
