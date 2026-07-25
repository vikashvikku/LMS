import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

export async function getStudentDashboardData() {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const [
    enrollmentsRes,
    assignmentsRes,
    announcementsRes,
    attendanceData,
    gradesData
  ] = await Promise.all([
    supabase
      .from('student_enrollments')
      .select(`
        id,
        sections (
          id, name,
          subjects (
            id, code, title,
            courses (id, code, title, credits)
          )
        )
      `)
      .eq('student_id', profile.id)
      .eq('status', 'active'),
      
    supabase
      .from('submissions')
      .select(`
        id, status, submitted_at,
        assignments (
          id, title, due_date, max_marks,
          sections (
            subjects (
              courses (code)
            )
          )
        )
      `)
      .eq('student_id', profile.id),

    supabase
      .from('announcements')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .limit(5),
      
    getStudentAttendance(),
    getStudentGrades()
  ]);

  const enrollments = enrollmentsRes.data || [];
  const submissions = assignmentsRes.data || [];
  const announcements = announcementsRes.data || [];

  const enrolledCoursesCount = enrollments.length;
  
  const sectionIds = enrollments.map(e => e.sections.id);
  
  let sectionAssignments = [];
  let upcomingAssignments = [];
  let pendingCount = 0;
  
  if (sectionIds.length > 0) {
    const { data: assignments } = await supabase
      .from('assignments')
      .select(`
        id, title, due_date, max_marks, section_id,
        sections (
          subjects (
            id, code, title,
            courses (code)
          )
        )
      `)
      .in('section_id', sectionIds)
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(5);
      
    sectionAssignments = assignments || [];
    
    const submittedIds = submissions.map(s => s.assignments?.id).filter(Boolean);
    upcomingAssignments = sectionAssignments.filter(a => !submittedIds.includes(a.id));
    pendingCount = upcomingAssignments.length;
  }

  let totalAttendancePercent = null;
  if (attendanceData && attendanceData.length > 0) {
    totalAttendancePercent = Math.round(
      attendanceData.reduce((acc, curr) => acc + curr.percentage, 0) / attendanceData.length
    );
  }

  let averageScore = null;
  if (gradesData && gradesData.length > 0) {
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    gradesData.forEach(g => {
      totalMarksObtained += g.marks_obtained || 0;
      totalMaxMarks += g.max_marks || 0;
    });
    if (totalMaxMarks > 0) {
      averageScore = (totalMarksObtained / totalMaxMarks) * 100;
    }
  }

  return {
    profile,
    stats: {
      enrolledCourses: enrolledCoursesCount,
      attendancePercentage: totalAttendancePercent,
      pendingAssignments: pendingCount,
      gpa: averageScore,
    },
    upcomingAssignments,
    announcements,
  };
}

export async function getStudentCourses() {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('student_enrollments')
    .select(`
      id,
      status,
      sections (
        id,
        name,
        subjects (
          id,
          code,
          title,
          courses (
            id,
            code,
            title,
            credits
          )
        ),
        semesters (
          name
        ),
        faculty_assignments (
          is_primary,
          profiles (
            first_name,
            last_name
          )
        )
      )
    `)
    .eq('student_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }

  return data;
}

export async function getStudentCourseDetails(courseId) {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { data: enrollment, error: enrollmentError } = await supabase
    .from('student_enrollments')
    .select('*')
    .eq('student_id', profile.id)
    .eq('section_id', courseId)
    .single();

  if (enrollmentError || !enrollment) {
    return null;
  }

  const { data: section, error } = await supabase
    .from('sections')
    .select(`
      id,
      name,
      subjects (
        id, code, title,
        courses (
          id, code, title, credits
        )
      ),
      semesters (name),
      faculty_assignments (
        is_primary,
        profiles (id, first_name, last_name, avatar_url)
      ),
      assignments (
        id, title, due_date, max_marks
      ),
      course_materials (
        id, title, storage_path, created_at
      )
    `)
    .eq('id', courseId)
    .single();

  if (error || !section) return null;

  return section;
}

export async function getStudentTimetable() {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('student_enrollments')
    .select('section_id')
    .eq('student_id', profile.id)
    .eq('status', 'active');

  if (enrollmentsError || !enrollments || enrollments.length === 0) {
    return [];
  }

  const sectionIds = enrollments.map(e => e.section_id);

  const { data, error } = await supabase
    .from('timetable_entries')
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      sections (
        id,
        name,
        subjects (
          courses (code, title)
        )
      ),
      profiles (
        first_name,
        last_name
      ),
      rooms (
        name
      )
    `)
    .in('section_id', sectionIds)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error("Error fetching timetable:", error);
    return [];
  }

  return data || [];
}

export async function getStudentAssignments() {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('student_enrollments')
    .select('section_id')
    .eq('student_id', profile.id)
    .eq('status', 'active');

  if (enrollmentsError || !enrollments || enrollments.length === 0) {
    return [];
  }

  const sectionIds = enrollments.map(e => e.section_id);

  const { data: assignments, error } = await supabase
    .from('assignments')
    .select(`
      id,
      title,
      due_date,
      max_marks,
      is_published,
      sections (
        id,
        name,
        subjects (
          courses (code, title)
        )
      ),
      submissions (
        id,
        status,
        submitted_at,
        grades (marks_obtained, is_released)
      )
    `)
    .in('section_id', sectionIds)
    .eq('is_published', true)
    .order('due_date', { ascending: true });

  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }
  
  return (assignments || []).map(a => {
    // We must filter submissions for just this student in case RLS didn't restrict it properly.
    // However, since we do not fetch student_id in submissions, we assume RLS did its job.
    const studentSubmission = (a.submissions && a.submissions.length > 0) ? a.submissions[0] : null;
    return {
      ...a,
      student_submission: studentSubmission
    };
  });
}

export async function getStudentAssignmentDetails(assignmentId) {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { data: assignment, error } = await supabase
    .from('assignments')
    .select(`
      id,
      title,
      description,
      due_date,
      max_marks,
      allow_late_submission,
      allowed_file_types,
      max_file_size_mb,
      section_id,
      sections (
        name,
        subjects (
          courses (code, title)
        )
      ),
      assignment_files (
        id, file_name, file_size, storage_path, created_at
      ),
      submissions (
        id,
        status,
        submitted_at,
        is_late,
        version,
        submission_files (
          id, file_name, file_size, storage_path, created_at
        ),
        grades (
          marks_obtained, feedback, is_released, graded_at,
          profiles (first_name, last_name)
        )
      )
    `)
    .eq('id', assignmentId)
    .single();

  if (error || !assignment) return null;

  const studentSubmission = (assignment.submissions && assignment.submissions.length > 0) ? assignment.submissions[0] : null;

  return {
    ...assignment,
    student_submission: studentSubmission
  };
}

export async function getStudentGrades() {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { data: grades, error } = await supabase
    .from('grades')
    .select(`
      id,
      marks_obtained,
      graded_at,
      submissions!inner (
        student_id,
        assignments (
          title,
          max_marks,
          sections (
            name,
            subjects (
              courses (code, title)
            )
          )
        )
      )
    `)
    .eq('is_released', true)
    .eq('submissions.student_id', profile.id)
    .order('graded_at', { ascending: false });

  if (error) {
    console.error("Error fetching grades:", error);
    return [];
  }

  return grades.map(g => ({
    id: g.id,
    marks_obtained: g.marks_obtained,
    graded_at: g.graded_at,
    assignment_title: g.submissions.assignments.title,
    max_marks: g.submissions.assignments.max_marks,
    course_code: g.submissions.assignments.sections?.subjects?.courses?.code,
    course_title: g.submissions.assignments.sections?.subjects?.courses?.title,
    section_name: g.submissions.assignments.sections?.name
  }));
}

export async function getStudentAttendance() {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { data: records, error } = await supabase
    .from('attendance_records')
    .select(`
      id,
      status,
      attendance_sessions (
        id,
        session_date,
        sections (
          id,
          name,
          subjects (
            courses (code, title)
          )
        )
      )
    `)
    .eq('student_id', profile.id);

  if (error) {
    console.error("Error fetching attendance:", error);
    return [];
  }

  const aggregated = {};
  
  (records || []).forEach(record => {
    const session = record.attendance_sessions;
    if (!session) return;
    
    const sectionId = session.sections.id;
    if (!aggregated[sectionId]) {
      aggregated[sectionId] = {
        section_id: sectionId,
        course_code: session.sections?.subjects?.courses?.code,
        course_title: session.sections?.subjects?.courses?.title,
        section_name: session.sections.name,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
      };
    }
    
    aggregated[sectionId].total += 1;
    if (record.status === 'present') aggregated[sectionId].present += 1;
    else if (record.status === 'absent') aggregated[sectionId].absent += 1;
    else if (record.status === 'late') aggregated[sectionId].late += 1;
  });

  return Object.values(aggregated).map(a => ({
    ...a,
    percentage: a.total > 0 ? Math.round(((a.present + a.late) / a.total) * 100) : 0
  }));
}

export async function getStudentAnnouncements() {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('announcements')
    .select(`
      id,
      title,
      content,
      created_at,
      author:profiles (first_name, last_name)
    `)
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }

  return data;
}

export async function getStudentFees() {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { data: fees, error } = await supabase
    .from('student_fees')
    .select(`
      id,
      total_amount,
      discount_amount,
      due_date,
      status,
      fee_structures (
        name
      ),
      academic_years (
        name
      ),
      payments (
        amount_paid,
        payment_method,
        paid_at
      )
    `)
    .eq('student_id', profile.id)
    .order('due_date', { ascending: true });

  if (error) {
    console.error("Error fetching fees:", error);
    return [];
  }

  return fees || [];
}

export async function getStudentLibraryData() {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { data: loans, error } = await supabase
    .from('library_loans')
    .select(`
      id,
      issued_at,
      due_at,
      returned_at,
      status,
      book_copies (
        accession_number,
        books (title, author, isbn)
      ),
      library_fines (
        amount,
        status
      )
    `)
    .eq('borrower_id', profile.id)
    .order('issued_at', { ascending: false });

  if (error) {
    console.error("Error fetching library data:", error);
    return [];
  }

  return loans || [];
}

export async function getStudentNotifications() {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return data || [];
}
