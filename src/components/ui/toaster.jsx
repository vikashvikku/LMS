"use client";

import React from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[99999] flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((t) => {
        const isSuccess = t.variant === "success";
        const isDestructive = t.variant === "destructive";

        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl p-4 shadow-lg border backdrop-blur-md transition-all duration-300 page-enter",
              isSuccess && "bg-card/95 border-success/30 text-card-foreground dark:bg-card/90",
              isDestructive && "bg-destructive text-white border-destructive/40 shadow-destructive/20",
              !isSuccess && !isDestructive && "bg-card/95 border-border text-card-foreground shadow-sm"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-success" />}
              {isDestructive && <AlertCircle className="h-5 w-5 text-white" />}
              {!isSuccess && !isDestructive && <Info className="h-5 w-5 text-primary" />}
            </div>

            <div className="flex-1 text-sm space-y-0.5">
              {t.title && (
                <div className="font-semibold leading-tight">
                  {t.title}
                </div>
              )}
              {t.description && (
                <div className={cn(
                  "text-xs opacity-90",
                  !isDestructive && "text-muted-foreground"
                )}>
                  {t.description}
                </div>
              )}
            </div>

            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
