"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Loader2, Power, ShieldAlert } from "lucide-react";
import { toggleCourseStatusAction } from "@/actions/courses";

export function ClientCourseActivationToggle({ courseId, isActive }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleCourseStatusAction(courseId, !isActive);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setOpen(false);
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
        <Button 
          variant={isActive ? "outline" : "default"} 
          size="sm" 
          className={`gap-2 ${!isActive ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200'}`}
        >
          <Power className="h-4 w-4" />
          {isActive ? 'Deactivate' : 'Reactivate'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            {isActive ? 'Deactivate Course?' : 'Reactivate Course?'}
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            {isActive 
              ? "Are you sure you want to deactivate this course? This will prevent new sections from being created or new enrollments, but preserve all historical data."
              : "Are you sure you want to reactivate this course?"}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="p-3 mt-2 rounded-md bg-destructive/15 border border-destructive/30 flex items-start gap-2 text-sm text-destructive font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        <DialogFooter className="mt-6">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant={isActive ? "destructive" : "default"}
            onClick={handleToggle}
            disabled={isPending}
            className={!isActive ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              isActive ? "Yes, Deactivate" : "Yes, Reactivate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
