"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleStudentActivationAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

export function ClientActivationToggle({ facultyId, isActive }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleToggle = () => {
    startTransition(async () => {
      // Toggle to the opposite of current state
      const result = await toggleStudentActivationAction(facultyId, !isActive);
      if (result?.success) {
        setConfirming(false);
        router.refresh();
      } else if (result?.error) {
        alert(result.error);
        setConfirming(false);
      }
    });
  };

  if (isActive) {
    if (confirming) {
      return (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-2 rounded-md border border-red-200 dark:border-red-900/50">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-xs font-medium text-red-800 dark:text-red-300">Are you sure?</span>
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setConfirming(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" className="h-7 text-xs px-2" onClick={handleToggle} disabled={isPending}>
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
          </Button>
        </div>
      );
    }

    return (
      <Button variant="destructive" onClick={() => setConfirming(true)} disabled={isPending}>
        Deactivate
      </Button>
    );
  }

  return (
    <Button variant="default" onClick={handleToggle} disabled={isPending}>
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Reactivate
    </Button>
  );
}
