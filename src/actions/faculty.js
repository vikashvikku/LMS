'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAttendanceSession, saveAttendanceRecords } from '@/lib/data/faculty'

export async function createSessionAction(formData) {
  const sectionId = formData.get('sectionId');
  const sessionDate = formData.get('sessionDate');
  const startTime = formData.get('startTime');
  const endTime = formData.get('endTime');

  if (!sectionId || !sessionDate || !startTime || !endTime) {
    return { error: 'All fields are required.' };
  }

  const result = await createAttendanceSession({
    section_id: sectionId,
    session_date: sessionDate,
    start_time: startTime,
    end_time: endTime
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath(`/faculty/attendance/${sectionId}`);
  redirect(`/faculty/attendance/${sectionId}/${result.data.id}`);
}

export async function saveAttendanceAction(sessionId, sectionId, attendanceData) {
  if (!sessionId || !sectionId || !attendanceData || !Array.isArray(attendanceData)) {
    return { error: 'Invalid attendance data.' };
  }

  const result = await saveAttendanceRecords(sessionId, sectionId, attendanceData);

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath(`/faculty/attendance/${sectionId}`);
  revalidatePath(`/faculty/attendance/${sectionId}/${sessionId}`);
  return { success: true };
}

export async function createAssignmentAction(formData) {
  const title = formData.get('title');
  const description = formData.get('description');
  const sectionId = formData.get('sectionId');
  const dueDate = formData.get('dueDate');
  const maxMarks = formData.get('maxMarks');
  const isPublished = formData.get('isPublished') === 'on';

  if (!title || !sectionId || !dueDate || !maxMarks) {
    return { error: 'Missing required fields.' };
  }

  const { createFacultyAssignment } = await import('@/lib/data/faculty');
  const result = await createFacultyAssignment({
    title,
    description: description || null,
    section_id: sectionId,
    due_date: new Date(dueDate).toISOString(),
    max_marks: parseFloat(maxMarks),
    is_published: isPublished
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath('/faculty/assignments');
  redirect(`/faculty/assignments/${result.data.id}`);
}

export async function updateAssignmentAction(formData) {
  const assignmentId = formData.get('assignmentId');
  const title = formData.get('title');
  const description = formData.get('description');
  const dueDate = formData.get('dueDate');
  const maxMarks = formData.get('maxMarks');
  const isPublished = formData.get('isPublished') === 'on';

  if (!assignmentId || !title || !dueDate || !maxMarks) {
    return { error: 'Missing required fields.' };
  }

  const { updateFacultyAssignment } = await import('@/lib/data/faculty');
  const result = await updateFacultyAssignment(assignmentId, {
    title,
    description: description || null,
    due_date: new Date(dueDate).toISOString(),
    max_marks: parseFloat(maxMarks),
    is_published: isPublished
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath('/faculty/assignments');
  revalidatePath(`/faculty/assignments/${assignmentId}`);
  redirect(`/faculty/assignments/${assignmentId}`);
}

export async function toggleAssignmentPublishAction(assignmentId, currentState) {
  const { updateFacultyAssignment } = await import('@/lib/data/faculty');
  const result = await updateFacultyAssignment(assignmentId, {
    is_published: !currentState
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath('/faculty/assignments');
  revalidatePath(`/faculty/assignments/${assignmentId}`);
  return { success: true };
}

export async function gradeSubmissionAction(formData) {
  const assignmentId = formData.get('assignmentId');
  const submissionId = formData.get('submissionId');
  const marks = parseFloat(formData.get('marks'));
  const feedback = formData.get('feedback');
  const isReleased = formData.get('isReleased') === 'on';
  
  if (!assignmentId || !submissionId || isNaN(marks)) {
    return { error: 'Missing or invalid fields.' };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const { requireRole } = await import('@/lib/auth');
  
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // 1. Get assignment and verify max marks
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select('id, section_id, max_marks')
    .eq('id', assignmentId)
    .single();

  if (assignmentError || !assignment) {
    return { error: 'Assignment not found.' };
  }

  // 2. Validate marks range against max marks
  if (marks < 0 || marks > assignment.max_marks) {
    return { error: `Marks must be between 0 and ${assignment.max_marks}.` };
  }

  // 3. Verify faculty assignment to this section
  const { data: assignmentCheck, error: checkError } = await supabase
    .from('faculty_assignments')
    .select('id')
    .eq('faculty_id', profile.id)
    .eq('section_id', assignment.section_id)
    .single();

  if (checkError || !assignmentCheck) {
    return { error: 'Not authorized for this section.' };
  }

  // 4. Upsert Grade
  const { error: gradeError } = await supabase
    .from('grades')
    .upsert(
      {
        submission_id: submissionId,
        marks_obtained: marks,
        feedback: feedback || null,
        graded_by: profile.id,
        is_released: isReleased
      },
      { onConflict: 'submission_id' }
    );

  if (gradeError) {
    console.error("Grade error:", gradeError);
    return { error: gradeError.message };
  }

  // 5. Update submission status to 'graded' if not returned
  // "returned" might be another state, but generally if we graded it, it's 'graded'
  const { error: subError } = await supabase
    .from('submissions')
    .update({ status: 'graded' })
    .eq('id', submissionId);

  if (subError) {
    console.error("Update submission status error:", subError);
    return { error: subError.message };
  }

  const { revalidatePath } = await import('next/cache');
  revalidatePath(`/faculty/assignments/${assignmentId}`);
  revalidatePath(`/faculty/grades`);
  revalidatePath(`/faculty/grades/${assignment.section_id}`);
  
  return { success: true };
}
