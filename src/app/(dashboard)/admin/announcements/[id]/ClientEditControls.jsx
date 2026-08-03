"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Trash2, Send } from "lucide-react";
import { updateAnnouncementAction, deleteAnnouncementAction, getProgramsAndSections } from "@/actions/announcements";

export function ClientEditControls({ announcement }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  // Edit State
  const [audienceType, setAudienceType] = useState(announcement.audience_type);
  const [publishOption, setPublishOption] = useState(
    announcement.status === "scheduled" ? "later" : "now"
  );
  const [programId, setProgramId] = useState(announcement.program_id || "");
  const [sectionId, setSectionId] = useState(announcement.section_id || "");
  
  const [programs, setPrograms] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isEditOpen && (audienceType === "specific_program" || audienceType === "specific_section")) {
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
  }, [isEditOpen, audienceType, programs.length]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);
    formData.append("id", announcement.id);
    formData.append("audience_type", audienceType);
    formData.append("publish_option", publishOption);
    if (programId) formData.append("program_id", programId);
    if (sectionId) formData.append("section_id", sectionId);

    startTransition(async () => {
      const result = await updateAnnouncementAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setIsEditOpen(false);
      }
    });
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteAnnouncementAction(announcement.id);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/admin/announcements");
      }
    });
  };

  const handlePublishNow = () => {
    setError(null);
    
    const formData = new FormData();
    formData.append("id", announcement.id);
    formData.append("title", announcement.title);
    formData.append("message", announcement.message);
    formData.append("audience_type", announcement.audience_type);
    if (announcement.program_id) formData.append("program_id", announcement.program_id);
    if (announcement.section_id) formData.append("section_id", announcement.section_id);
    formData.append("publish_option", "now");

    startTransition(async () => {
      const result = await updateAnnouncementAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const filteredSections = sections.filter(s => s.program_id === programId);

  // Parse existing scheduled time for defaults if editing a scheduled announcement
  let defaultDate = "";
  let defaultTime = "";
  if (announcement.scheduled_at) {
    const d = new Date(announcement.scheduled_at);
    defaultDate = d.toISOString().split("T")[0];
    defaultTime = d.toISOString().split("T")[1].substring(0, 5);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {announcement.status === "draft" && (
        <Button onClick={handlePublishNow} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Publish Now
        </Button>
      )}
      
      <Button variant="outline" onClick={() => setIsEditOpen(true)} disabled={isPending} className="gap-2">
        <Edit className="h-4 w-4" /> Edit
      </Button>
      
      <Button variant="destructive" onClick={() => setIsDeleteOpen(true)} disabled={isPending} className="gap-2">
        <Trash2 className="h-4 w-4" /> Delete
      </Button>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Announcement?</DialogTitle>
            <DialogDescription>
              This announcement will be permanently deleted. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
              <DialogDescription>
                Update the details of this announcement.
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
                <Input id="title" name="title" defaultValue={announcement.title} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="message" 
                  name="message" 
                  defaultValue={announcement.message}
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
                    <Input type="date" id="scheduled_date" name="scheduled_date" defaultValue={defaultDate} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_time">Time <span className="text-destructive">*</span></Label>
                    <Input type="time" id="scheduled_time" name="scheduled_time" defaultValue={defaultTime} required />
                  </div>
                </div>
              )}

            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
