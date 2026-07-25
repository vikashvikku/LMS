import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

/**
 * Get all faculty assignments for the authenticated faculty member,
 * with full section → subject → course chain.
 */
export async function getFacultyCourses() {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('faculty_assignments')
    .select(`
      id,
      is_primary,
      sections (
        id,
        name,
        capacity,
        subjects (
          id,
          title,
          code,
          courses (
            id,
            code,
            title,
            credits
          )
        ),
        semesters (
          id,
          name,
          academic_years (
            id,
            name,
            is_active
          )
        ),
        student_enrollments (count)
      )
    `)
    .eq('faculty_id', profile.id);

  if (error || !data) {
    console.error("Error fetching faculty courses:", error);
    return [];
  }

  // Deduplicate by section_id
  const uniqueMap = new Map();
  for (const fa of data) {
    if (fa.sections && !uniqueMap.has(fa.sections.id)) {
      uniqueMap.set(fa.sections.id, fa);
    }
  }

  return Array.from(uniqueMap.values());
}

/**
 * Get a single section/course detail for the authenticated faculty member.
 * Validates the faculty member is actually assigned to this section.
 */
export async function getFacultyCourseById(sectionId) {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // Verify faculty assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from('faculty_assignments')
    .select('id, is_primary')
    .eq('faculty_id', profile.id)
    .eq('section_id', sectionId)
    .single();

  if (assignmentError || !assignment) {
    return null;
  }

  // Fetch full section details
  const { data: section, error } = await supabase
    .from('sections')
    .select(`
      id,
      name,
      capacity,
      subjects (
        id,
        title,
        code,
        courses (
          id,
          code,
          title,
          credits
        )
      ),
      semesters (
        id,
        name,
        academic_years (
          id,
          name,
          is_active
        )
      ),
      student_enrollments (
        id,
        status,
        profiles (
          id,
          first_name,
          last_name,
          avatar_url
        )
      ),
      assignments (
        id,
        title,
        due_date,
        max_marks,
        is_published,
        created_at,
        submissions (count)
      ),
      course_materials (
        id,
        title,
        storage_path,
        created_at
      )
    `)
    .eq('id', sectionId)
    .single();

  if (error || !section) {
    console.error("Error fetching faculty course detail:", error);
    return null;
  }

  return {
    ...section,
    faculty_assignment: assignment,
  };
}

/**
 * Get dashboard data for the authenticated faculty member.
 */
export async function getFacultyDashboardData() {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // Get all faculty assignments with section details
  const [assignmentsRes, timetableRes, announcementsRes] = await Promise.all([
    supabase
      .from('faculty_assignments')
      .select(`
        id,
        is_primary,
        sections (
          id,
          name,
          subjects (
            courses (code, title)
          ),
          semesters (
            name
          ),
          student_enrollments (count),
          assignments (
            id,
            title,
            due_date,
            is_published,
            submissions (count)
          )
        )
      `)
      .eq('faculty_id', profile.id),

    supabase
      .from('timetable_entries')
      .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        sections (
          name,
          subjects (
            courses (code, title)
          )
        ),
        rooms (
          name
        )
      `)
      .eq('faculty_id', profile.id)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true }),

    supabase
      .from('announcements')
      .select('id, title, content, created_at')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const uniqueMap = new Map();
  for (const fa of (assignmentsRes.data || [])) {
    if (fa.sections && !uniqueMap.has(fa.sections.id)) {
      uniqueMap.set(fa.sections.id, fa);
    }
  }
  const facultyAssignments = Array.from(uniqueMap.values());
  const assignedSections = facultyAssignments.length;
  const timetable = timetableRes.data || [];
  const announcements = announcementsRes.data || [];

  let totalStudents = 0;
  let totalAssignments = 0;
  let pendingSubmissions = 0;
  const upcomingDeadlines = [];

  for (const fa of facultyAssignments) {
    const section = fa.sections;
    if (!section) continue;

    // student_enrollments (count) returns [{count: N}]
    const enrollmentCount = section.student_enrollments?.[0]?.count || 0;
    totalStudents += enrollmentCount;

    for (const assignment of (section.assignments || [])) {
      totalAssignments++;

      const submissionCount = assignment.submissions?.[0]?.count || 0;
      const dueDate = new Date(assignment.due_date);

      // Pending = enrolled students minus submitted
      if (assignment.is_published) {
        pendingSubmissions += Math.max(0, enrollmentCount - submissionCount);
      }

      // Upcoming deadlines (future assignments)
      if (dueDate > new Date()) {
        upcomingDeadlines.push({
          id: assignment.id,
          title: assignment.title,
          due_date: assignment.due_date,
          course_code: section.subjects?.courses?.code,
          section_name: section.name,
        });
      }
    }
  }

  // Sort upcoming deadlines by date
  upcomingDeadlines.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  // Today's classes
  const currentDay = new Date().getDay();
  const todayClasses = timetable.filter(t => t.day_of_week === currentDay);

  return {
    profile,
    stats: {
      assignedSections,
      totalStudents,
      totalAssignments,
      pendingSubmissions,
    },
    upcomingDeadlines: upcomingDeadlines.slice(0, 5),
    todayClasses,
    announcements,
  };
}

/**
 * Get attendance overview for all assigned sections.
 */
export async function getFacultyAttendanceOverview() {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('faculty_assignments')
    .select(`
      id,
      sections (
        id,
        name,
        subjects (
          code,
          title,
          courses (code, title)
        ),
        semesters (name),
        student_enrollments (count),
        attendance_sessions (
          id,
          session_date
        )
      )
    `)
    .eq('faculty_id', profile.id);

  if (error || !data) {
    console.error("Error fetching attendance overview:", error);
    return [];
  }

  const uniqueMap = new Map();
  for (const fa of data) {
    if (fa.sections && !uniqueMap.has(fa.sections.id)) {
      uniqueMap.set(fa.sections.id, fa);
    }
  }

  return Array.from(uniqueMap.values());
}

/**
 * Get attendance sessions for a specific section.
 */
export async function getFacultySectionAttendance(sectionId) {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // Verify faculty assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from('faculty_assignments')
    .select('id')
    .eq('faculty_id', profile.id)
    .eq('section_id', sectionId)
    .single();

  if (assignmentError || !assignment) {
    return null;
  }

  const { data: section, error } = await supabase
    .from('sections')
    .select(`
      id,
      name,
      subjects (
        title,
        courses (code, title)
      ),
      student_enrollments (
        id
      )
    `)
    .eq('id', sectionId)
    .single();

  if (error || !section) return null;

  // Active enrollments only
  const { count: enrolledCount } = await supabase
    .from('student_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('section_id', sectionId)
    .eq('status', 'active');

  const { data: sessions, error: sessionsError } = await supabase
    .from('attendance_sessions')
    .select(`
      id,
      session_date,
      start_time,
      end_time,
      profiles (
        first_name,
        last_name
      ),
      attendance_records (
        status
      )
    `)
    .eq('section_id', sectionId)
    .order('session_date', { ascending: false })
    .order('start_time', { ascending: false });

  if (sessionsError) {
    console.error("Error fetching sessions:", sessionsError);
  }

  return {
    section,
    enrolledCount: enrolledCount || 0,
    sessions: sessions || []
  };
}

/**
 * Get details of a single attendance session, including all enrolled students and their records.
 */
export async function getAttendanceSession(sessionId) {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // Get session details and verify it belongs to a section this faculty teaches
  const { data: session, error: sessionError } = await supabase
    .from('attendance_sessions')
    .select(`
      *,
      sections (
        id,
        name,
        subjects (courses (code, title))
      )
    `)
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) return null;

  // Verify faculty assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from('faculty_assignments')
    .select('id')
    .eq('faculty_id', profile.id)
    .eq('section_id', session.section_id)
    .single();

  if (assignmentError || !assignment) return null;

  // Get enrolled students (active only)
  const { data: enrollments, error: enrollError } = await supabase
    .from('student_enrollments')
    .select(`
      student_id,
      profiles (
        id,
        first_name,
        last_name
      )
    `)
    .eq('section_id', session.section_id)
    .eq('status', 'active');

  // Get existing records
  const { data: records, error: recordsError } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('session_id', sessionId);

  return {
    session,
    enrollments: enrollments || [],
    records: records || []
  };
}

/**
 * Create a new attendance session.
 */
export async function createAttendanceSession(data) {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // Verify assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from('faculty_assignments')
    .select('id')
    .eq('faculty_id', profile.id)
    .eq('section_id', data.section_id)
    .single();

  if (assignmentError || !assignment) {
    return { error: 'Not authorized for this section.' };
  }

  const { data: session, error } = await supabase
    .from('attendance_sessions')
    .insert({
      section_id: data.section_id,
      faculty_id: profile.id, // Current authenticated faculty
      session_date: data.session_date,
      start_time: data.start_time,
      end_time: data.end_time
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    return { error: error.message };
  }

  return { data: session };
}

/**
 * Upsert attendance records for a session.
 */
export async function saveAttendanceRecords(sessionId, sectionId, attendanceData) {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // Verify assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from('faculty_assignments')
    .select('id')
    .eq('faculty_id', profile.id)
    .eq('section_id', sectionId)
    .single();

  if (assignmentError || !assignment) {
    return { error: 'Not authorized for this section.' };
  }
  
  // Verify session belongs to section
  const { data: session, error: sessionError } = await supabase
    .from('attendance_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('section_id', sectionId)
    .single();

  if (sessionError || !session) {
    return { error: 'Invalid session for this section.' };
  }

  const recordsToUpsert = attendanceData.map(record => ({
    session_id: sessionId,
    student_id: record.student_id,
    status: record.status,
    marked_by: profile.id
  }));

  const { error } = await supabase
    .from('attendance_records')
    .upsert(recordsToUpsert, { onConflict: 'session_id,student_id' });

  if (error) {
    console.error("Error saving attendance:", error);
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Get all assignments for sections assigned to the faculty.
 */
export async function getFacultyAssignments() {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('assignments')
    .select(`
      id,
      title,
      due_date,
      max_marks,
      is_published,
      created_at,
      section_id,
      sections (
        name,
        subjects (courses (code, title)),
        semesters (name),
        student_enrollments (count)
      ),
      submissions (count)
    `)
    // Due to RLS, this naturally filters down to only assignments for sections they teach.
    // However, to be explicit and avoid any potential bugs, we can also filter using a subquery if we had one,
    // but the RLS `is_faculty_for_section` handles it.
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a specific assignment, verifying authorization.
 */
export async function getFacultyAssignmentById(assignmentId) {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // RLS inherently blocks access if not authorized, but we want a nice 404
  const { data: assignment, error } = await supabase
    .from('assignments')
    .select(`
      *,
      sections (
        id,
        name,
        subjects (courses (code, title)),
        student_enrollments (count)
      )
    `)
    .eq('id', assignmentId)
    .single();

  if (error || !assignment) {
    return null;
  }
  
  // Verify assignment explicitly just in case
  const { data: facultyAssignment, error: assignmentError } = await supabase
    .from('faculty_assignments')
    .select('id')
    .eq('faculty_id', profile.id)
    .eq('section_id', assignment.section_id)
    .single();

  if (assignmentError || !facultyAssignment) {
    return null;
  }

  return assignment;
}

/**
 * Get submissions for a specific assignment.
 */
export async function getAssignmentSubmissions(assignmentId) {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // Validate the faculty owns this assignment's section
  const assignment = await getFacultyAssignmentById(assignmentId);
  if (!assignment) return null;

  // Get active enrollments to diff against submissions
  const { data: enrollments, error: enrollError } = await supabase
    .from('student_enrollments')
    .select(`
      student_id,
      profiles (id, first_name, last_name, avatar_url)
    `)
    .eq('section_id', assignment.section_id)
    .eq('status', 'active');

  // Get submissions
  const { data: submissions, error: subError } = await supabase
    .from('submissions')
    .select(`
      *,
      submission_files (id, file_name, file_size, storage_path, created_at)
    `)
    .eq('assignment_id', assignmentId);

  if (enrollError || subError) {
    console.error("Error fetching submissions:", enrollError || subError);
    return null;
  }

  return {
    assignment,
    enrollments: enrollments || [],
    submissions: submissions || []
  };
}

/**
 * Create a new assignment.
 */
export async function createFacultyAssignment(payload) {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // Verify faculty assignment to section
  const { data: assignmentCheck, error: checkError } = await supabase
    .from('faculty_assignments')
    .select('id')
    .eq('faculty_id', profile.id)
    .eq('section_id', payload.section_id)
    .single();

  if (checkError || !assignmentCheck) {
    return { error: 'Not authorized for this section.' };
  }

  const { data, error } = await supabase
    .from('assignments')
    .insert({
      ...payload,
      faculty_id: profile.id
    })
    .select()
    .single();

  if (error) {
    console.error("Create assignment error:", error);
    return { error: error.message };
  }

  return { data };
}

/**
 * Update an existing assignment.
 */
export async function updateFacultyAssignment(assignmentId, payload) {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // Verify assignment ownership
  const existing = await getFacultyAssignmentById(assignmentId);
  if (!existing) {
    return { error: 'Assignment not found or unauthorized.' };
  }

  const { data, error } = await supabase
    .from('assignments')
    .update(payload)
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) {
    console.error("Update assignment error:", error);
    return { error: error.message };
  }

  return { data };
}

/**
 * Get the Faculty Gradebook Overview
 */
export async function getFacultyGradebook() {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('faculty_assignments')
    .select(`
      id,
      section_id,
      sections (
        id,
        name,
        subjects (
          code,
          title
        ),
        semesters (name),
        student_enrollments (count),
        assignments (
          id,
          submissions (
            id,
            status,
            grades (id)
          )
        )
      )
    `)
    .eq('faculty_id', profile.id);

  if (error || !data) {
    console.error("Error fetching gradebook overview:", error);
    return [];
  }

  const uniqueMap = new Map();
  for (const fa of data) {
    if (fa.sections && !uniqueMap.has(fa.sections.id)) {
      uniqueMap.set(fa.sections.id, fa);
    }
  }

  return Array.from(uniqueMap.values());
}

/**
 * Get Section Gradebook
 */
export async function getFacultySectionGradebook(sectionId) {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // Verify faculty assignment explicitly
  const { data: assignmentCheck, error: checkError } = await supabase
    .from('faculty_assignments')
    .select('id')
    .eq('faculty_id', profile.id)
    .eq('section_id', sectionId)
    .single();

  if (checkError || !assignmentCheck) {
    return null;
  }

  // Get active enrollments
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select(`
      student_id,
      profiles (id, first_name, last_name)
    `)
    .eq('section_id', sectionId)
    .eq('status', 'active');

  // Get published assignments for this section
  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      id,
      title,
      max_marks,
      due_date,
      is_published
    `)
    .eq('section_id', sectionId)
    .order('created_at', { ascending: true });

  // Get all submissions for these assignments
  const assignmentIds = assignments?.map(a => a.id) || [];
  let submissions = [];
  
  if (assignmentIds.length > 0) {
    const { data: subs } = await supabase
      .from('submissions')
      .select(`
        id,
        assignment_id,
        student_id,
        status,
        grades (
          marks_obtained,
          is_released
        )
      `)
      .in('assignment_id', assignmentIds);
    submissions = subs || [];
  }

  const { data: section } = await supabase
    .from('sections')
    .select('name, subjects(code, title)')
    .eq('id', sectionId)
    .single();

  return {
    section,
    enrollments: enrollments || [],
    assignments: assignments || [],
    submissions
  };
}

/**
 * Get a specific submission for grading
 */
export async function getSubmissionForGrading(assignmentId, submissionId) {
  const profile = await requireRole(['faculty', 'department_head']);
  const supabase = await createClient();

  // 1. Verify assignment belongs to faculty's section
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select('*, sections(id, name, subjects(code, title))')
    .eq('id', assignmentId)
    .single();

  if (assignmentError || !assignment) return null;

  const { data: check } = await supabase
    .from('faculty_assignments')
    .select('id')
    .eq('faculty_id', profile.id)
    .eq('section_id', assignment.section_id)
    .single();

  if (!check) return null;

  // 2. Retrieve submission
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles (id, first_name, last_name),
      submission_files (*),
      grades (*)
    `)
    .eq('id', submissionId)
    .eq('assignment_id', assignmentId)
    .single();

  if (subError || !submission) return null;

  return { assignment, submission };
}
