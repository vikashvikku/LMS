const FIXTURES = {
  orgA: null,
  orgB: null,
  studentA: null,
  studentB: null,
  studentC: null,
  facultyA: null,
  facultyB: null,
  facultyC: null,
  deptHeadA: null,
  parentA: null,
  financeA: null,
  librarianA: null,
  adminA: null,
  adminB: null,
  departmentA: null,
  sectionA: null,
  assignmentA: null,
  submissionA: null
};

async function createAuthUser(admin, email, role, orgId) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: 'TestPassword123!',
    email_confirm: true,
  });
  if (error) {
    throw new Error(`Failed to create test user ${email}: ${error.message}`);
  }
  
  // Update profile via trusted service role RPC (ignoring the trigger's default 'student')
  const { error: profileError } = await admin.rpc('provision_security_test_profile', {
    target_user_id: data.user.id,
    target_role: role,
    target_org_id: orgId
  });

  if (profileError) {
    throw new Error(`Failed to update profile for ${email}: ${profileError.message}`);
  }

  return data.user.id;
}

async function setupFixtures(admin) {
  console.log("Provisioning test fixtures...");

  // Organizations
  const { data: orgA } = await admin.from('organizations').insert({ name: 'TEST_FIXTURE_ORG_A' }).select('id').single();
  const { data: orgB } = await admin.from('organizations').insert({ name: 'TEST_FIXTURE_ORG_B' }).select('id').single();
  FIXTURES.orgA = orgA.id;
  FIXTURES.orgB = orgB.id;

  // Users for Org A
  FIXTURES.studentA = await createAuthUser(admin, 'sec_test_student_a@campusos.local', 'student', orgA.id);
  FIXTURES.studentB = await createAuthUser(admin, 'sec_test_student_b@campusos.local', 'student', orgA.id);
  FIXTURES.facultyA = await createAuthUser(admin, 'sec_test_faculty_a@campusos.local', 'faculty', orgA.id);
  FIXTURES.facultyB = await createAuthUser(admin, 'sec_test_faculty_b@campusos.local', 'faculty', orgA.id);
  FIXTURES.deptHeadA = await createAuthUser(admin, 'sec_test_dept_head_a@campusos.local', 'department_head', orgA.id);
  FIXTURES.parentA = await createAuthUser(admin, 'sec_test_parent_a@campusos.local', 'parent', orgA.id);
  FIXTURES.financeA = await createAuthUser(admin, 'sec_test_finance_a@campusos.local', 'finance', orgA.id);
  FIXTURES.librarianA = await createAuthUser(admin, 'sec_test_librarian_a@campusos.local', 'librarian', orgA.id);
  FIXTURES.adminA = await createAuthUser(admin, 'sec_test_admin_a@campusos.local', 'university_admin', orgA.id);

  // Users for Org B
  FIXTURES.studentC = await createAuthUser(admin, 'sec_test_student_c@campusos.local', 'student', orgB.id);
  FIXTURES.facultyC = await createAuthUser(admin, 'sec_test_faculty_c@campusos.local', 'faculty', orgB.id);
  FIXTURES.adminB = await createAuthUser(admin, 'sec_test_admin_b@campusos.local', 'university_admin', orgB.id);

  // Relational data for Org A
  const { data: dept } = await admin.from('departments').insert({ organization_id: orgA.id, name: 'TEST_FIXTURE_DEPT' }).select('id').single();
  FIXTURES.departmentA = dept.id;

  const { data: prog } = await admin.from('programs').insert({ department_id: dept.id, name: 'TEST_FIXTURE_PROG' }).select('id').single();
  const { data: course } = await admin.from('courses').insert({ program_id: prog.id, code: 'TEST101', title: 'TEST' }).select('id').single();
  const { data: term } = await admin.from('academic_terms').insert({ organization_id: orgA.id, name: 'TEST_FIXTURE_TERM' }).select('id').single();
  const { data: section } = await admin.from('sections').insert({ course_id: course.id, term_id: term.id, name: 'TEST_SEC' }).select('id').single();
  FIXTURES.sectionA = section.id;

  // Faculty Assignment (Faculty A -> Section A)
  await admin.from('faculty_assignments').insert({ faculty_id: FIXTURES.facultyA, section_id: section.id, role: 'primary' });
  
  // Student Enrollment (Student A -> Section A)
  await admin.from('student_enrollments').insert({ student_id: FIXTURES.studentA, section_id: section.id, status: 'active' });

  // Parent-Student Link (Parent A -> Student A)
  await admin.from('parent_student_links').insert({ parent_id: FIXTURES.parentA, student_id: FIXTURES.studentA, status: 'approved' });

  // Assignment & Submission
  const { data: assignment } = await admin.from('assignments').insert({ section_id: section.id, title: 'TEST_ASSIGNMENT' }).select('id').single();
  FIXTURES.assignmentA = assignment.id;
  const { data: submission } = await admin.from('submissions').insert({ assignment_id: assignment.id, student_id: FIXTURES.studentA, status: 'submitted' }).select('id').single();
  FIXTURES.submissionA = submission.id;

  console.log("Fixtures provisioned successfully.");
  return FIXTURES;
}

module.exports = { setupFixtures, FIXTURES };
