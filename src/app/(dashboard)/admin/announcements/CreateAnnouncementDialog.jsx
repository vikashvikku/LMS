"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { createAnnouncementAction, getProgramsAndSections } from "@/actions/announcements";

export function CreateAnnouncementDialog({ open, onOpenChange }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  
  const [audienceType, setAudienceType] = useState("everyone");
  const [publishOption, setPublishOption] = useState("now");
  
  const [programId, setProgramId] = useState("");
  const [sectionId, setSectionId] = useState("");
  
  const [programs, setPrograms] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (open && (audienceType === "specific_program" || audienceType === "specific_section")) {
      if (programs.length === 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoadingData(true);
        getProgramsAndSections().then(data => {
          setPrograms(data.programs);
          setSections(data.sections);
          setIsLoadingData(false);
        });
      }
    }
  }, [open, audienceType, programs.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);
    formData.append("audience_type", audienceType);
    formData.append("publish_option", publishOption);
    if (programId) formData.append("program_id", programId);
    if (sectionId) formData.append("section_id", sectionId);

    startTransition(async () => {
      const result = await createAnnouncementAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        onOpenChange(false);
        // Reset form state
        setAudienceType("everyone");
        setPublishOption("now");
        setProgramId("");
        setSectionId("");
      }
    });
  };

  const filteredSections = sections.filter(s => s.program_id === programId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>
              Draft and publish a new announcement for the campus.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-5">
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 text-sm text-destructive font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input id="title" name="title" placeholder="E.g., Mid-Term Exam Schedule" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
              <Textarea 
                id="message" 
                name="message" 
                placeholder="Write your announcement here..." 
                className="min-h-[120px]" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Audience <span className="text-destructive">*</span></Label>
                <Select value={audienceType} onValueChange={(val) => {
                  setAudienceType(val);
                  setProgramId("");
                  setSectionId("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="specific_program">Specific Program</SelectItem>
                    <SelectItem value="specific_section">Specific Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Publish Option <span className="text-destructive">*</span></Label>
                <Select value={publishOption} onValueChange={setPublishOption}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Publish Now</SelectItem>
                    <SelectItem value="later">Schedule for Later</SelectItem>
                    <SelectItem value="draft">Save as Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dynamic Audience Fields */}
            {(audienceType === "specific_program" || audienceType === "specific_section") && (
              <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-4">
                {isLoadingData ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading targeting options...
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Select Program <span className="text-destructive">*</span></Label>
                      <Select value={programId} onValueChange={(val) => {
                        setProgramId(val);
                        setSectionId("");
                      }} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose program" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {audienceType === "specific_section" && (
                      <div className="space-y-2">
                        <Label>Select Section <span className="text-destructive">*</span></Label>
                        <Select value={sectionId} onValueChange={setSectionId} required disabled={!programId}>
                          <SelectTrigger>
                            <SelectValue placeholder={programId ? "Choose section" : "Select program first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSections.length > 0 ? filteredSections.map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            )) : (
                              <SelectItem value="none" disabled>No sections available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Dynamic Schedule Fields */}
            {publishOption === "later" && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Date <span className="text-destructive">*</span></Label>
                  <Input type="date" id="scheduled_date" name="scheduled_date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled_time">Time <span className="text-destructive">*</span></Label>
                  <Input type="time" id="scheduled_time" name="scheduled_time" required />
                </div>
              </div>
            )}

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {publishOption === "now" ? "Publish Announcement" : publishOption === "draft" ? "Save Draft" : "Schedule Announcement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
