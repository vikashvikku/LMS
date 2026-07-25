"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleAssignmentPublishAction } from "@/actions/faculty";
import { Loader2, Globe, Lock } from "lucide-react";

export function PublishToggle({ assignmentId, isPublished }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleAssignmentPublishAction(assignmentId, isPublished);
    });
  };

  return (
    <Button 
      variant={isPublished ? "outline" : "default"}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isPublished ? (
        <Lock className="mr-2 h-4 w-4" />
      ) : (
        <Globe className="mr-2 h-4 w-4" />
      )}
      {isPublished ? "Unpublish" : "Publish to Students"}
    </Button>
  );
}
