"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEnrollmentStatusAction } from "@/actions/admin";
import { Loader2 } from "lucide-react";

export function ClientEnrollmentManager({ enrollmentId, currentStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    startTransition(async () => {
      const result = await updateEnrollmentStatusAction(enrollmentId, newStatus);
      if (result?.success) {
        router.refresh();
      } else if (result?.error) {
        alert(result.error);
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'withdrawn': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        disabled={isPending}
        value={currentStatus}
        onChange={handleStatusChange}
        className={`appearance-none text-xs font-semibold px-2.5 py-0.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer uppercase tracking-wide transition-colors ${getStatusColor(currentStatus)}`}
      >
        <option value="active">ACTIVE</option>
        <option value="withdrawn">WITHDRAWN</option>
        <option value="completed">COMPLETED</option>
      </select>
      {isPending && <Loader2 className="absolute -right-5 h-3.5 w-3.5 animate-spin text-muted-foreground" />}
    </div>
  );
}
