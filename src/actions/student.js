'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

export async function submitAssignmentAction(assignmentId) {
  if (!assignmentId) {
    return { error: 'Assignment ID is required.' };
  }

  const profile = await requireRole(['student']);
  const supabase = await createClient();

  // 1. Verify student is enrolled in the section for this assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select('section_id, due_date, allow_late_submission')
    .eq('id', assignmentId)
    .single();

  if (assignmentError || !assignment) {
    return { error: 'Assignment not found.' };
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from('student_enrollments')
    .select('id')
    .eq('student_id', profile.id)
    .eq('section_id', assignment.section_id)
    .single();

  if (enrollmentError || !enrollment) {
    return { error: 'You are not enrolled in this course section.' };
  }

  // 2. Check due date logic
  const now = new Date();
  const dueDate = new Date(assignment.due_date);
  const isLate = now > dueDate;

  if (isLate && !assignment.allow_late_submission) {
    return { error: 'Late submissions are not allowed for this assignment.' };
  }

  // 3. Upsert submission
  const { error: submissionError } = await supabase
    .from('submissions')
    .upsert({
      assignment_id: assignmentId,
      student_id: profile.id,
      status: 'submitted',
      submitted_at: now.toISOString(),
      is_late: isLate
    }, { onConflict: 'assignment_id, student_id' });

  if (submissionError) {
    console.error('Submission error:', submissionError);
    return { error: 'Failed to submit assignment. Database error.' };
  }

  revalidatePath(`/student/assignments/${assignmentId}`);
  revalidatePath(`/student/assignments`);
  revalidatePath(`/student/dashboard`);
  
  return { success: true };
}
