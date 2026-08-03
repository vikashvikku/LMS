"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, MoreHorizontal, UserMinus, ArrowRightLeft } from "lucide-react";
import { removeStudentFromSectionAction, moveStudentSectionAction } from "@/actions/sections";

export function ClientStudentActions({ enrollmentId, sectionId, studentId, siblingSections }) {
  const [isPending, startTransition] = useTransition();
  
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  const [moveOpen, setMoveOpen] = useState(false);
  const [moveError, setMoveError] = useState(null);
  const [targetSection, setTargetSection] = useState("");

  const handleRemove = () => {
    setRemoveError(null);
    startTransition(async () => {
      const result = await removeStudentFromSectionAction(enrollmentId, sectionId);
      if (result?.error) {
        setRemoveError(result.error);
      } else {
        setRemoveOpen(false);
      }
    });
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (!targetSection) return;
    setMoveError(null);
    
    startTransition(async () => {
      const result = await moveStudentSectionAction(enrollmentId, sectionId, targetSection);
      if (result?.error) {
        setMoveError(result.error);
      } else {
        setMoveOpen(false);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setMoveOpen(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            <span>Move to another section</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setRemoveOpen(true)} className="text-destructive focus:text-destructive">
            <UserMinus className="mr-2 h-4 w-4" />
            <span>Remove from section</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Remove Dialog */}
      <Dialog open={removeOpen} onOpenChange={(val) => !isPending && setRemoveOpen(val)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Remove Student?</DialogTitle>
            <DialogDescription>
              This will remove the student from this section. They will no longer have access to this section&apos;s materials or attendance records.
            </DialogDescription>
          </DialogHeader>
          
          {removeError && (
            <div className="p-3 mt-2 rounded-md bg-destructive/15 border border-destructive/30 flex items-start gap-2 text-sm text-destructive font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{removeError}</p>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={() => setRemoveOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleRemove} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={moveOpen} onOpenChange={(val) => {
        if (!isPending) {
          setMoveOpen(val);
          if (!val) {
            setTargetSection("");
            setMoveError(null);
          }
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleMove}>
            <DialogHeader>
              <DialogTitle>Move Student</DialogTitle>
              <DialogDescription>
                Transfer this student to another active section for the same course.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-6">
              {moveError && (
                <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 flex items-start gap-2 text-sm text-destructive font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>{moveError}</p>
                </div>
              )}
              
              <div className="grid gap-2">
                <Label>Destination Section <span className="text-red-500">*</span></Label>
                <Select value={targetSection} onValueChange={setTargetSection} required disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section..." />
                  </SelectTrigger>
                  <SelectContent>
                    {siblingSections.length > 0 ? (
                      siblingSections.map(sec => {
                        const isFull = sec.students_count >= sec.capacity;
                        return (
                          <SelectItem key={sec.id} value={sec.id} disabled={isFull}>
                            {sec.name} {sec.code ? `(${sec.code})` : ''} 
                            {isFull ? ' - FULL' : ` - ${sec.capacity - sec.students_count} seats left`}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="none" disabled>No other active sections available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setMoveOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !targetSection}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Moving...
                  </>
                ) : (
                  "Move Student"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
