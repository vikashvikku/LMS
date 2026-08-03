"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFacultyAssignmentAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ClientAssignmentManager({ assignmentId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      const result = await deleteFacultyAssignmentAction(assignmentId);
      if (result?.success) {
        setOpen(false);
        router.refresh();
      } else if (result?.error) {
        alert(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!isPending) setOpen(val) }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Assignment</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this teaching assignment? The faculty member will no longer have access to this section.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" disabled={isPending} onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleRemove} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
