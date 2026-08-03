'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { submitAssignmentAction } from '@/actions/student';
import { useRouter } from 'next/navigation';

export function SubmitButton({ assignmentId, isSubmitted, disabled, isLate }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleSubmit() {
    setIsPending(true);
    setError(null);
    try {
      const result = await submitAssignmentAction(assignmentId);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsPending(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-2 w-full">
        <Button disabled variant="outline" className="w-full border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Assignment Submitted
        </Button>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full">
      <Button 
        onClick={handleSubmit} 
        disabled={disabled || isPending} 
        className="w-full"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        {isLate ? 'Submit Late' : 'Submit Assignment'}
      </Button>
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
