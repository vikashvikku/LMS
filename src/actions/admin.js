"use server";

import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function createStudentAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    
    // We use the authenticated client for reading validation data (RLS will enforce access)
    const supabase = await createClient();
    
    const email = formData.get("email");
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const programId = formData.get("programId");
    const sectionIdsStr = formData.get("sectionId");

    if (!email || !firstName || !lastName || !programId || !sectionIdsStr) {
      return { error: "Missing required fields." };
    }

    const sectionIds = sectionIdsStr.split(',');

    // 1. Validate that all sections belong to the admin's organization AND the selected program
    const { data: sections, error: sectionError } = await supabase
      .from('sections')
      .select('id, subjects(courses(program_id, programs(departments(organization_id))))')
      .in('id', sectionIds);

    if (sectionError || !sections || sections.length !== sectionIds.length) {
      return { error: "Invalid section selected or you do not have permission to access it." };
    }

    for (const section of sections) {
      const orgId = section.subjects?.courses?.programs?.departments?.organization_id;
      const secProgramId = section.subjects?.courses?.program_id;
      
      if (orgId !== profile.organization_id) {
        return { error: "Security validation failed. Section does not belong to your organization." };
      }
      if (secProgramId !== programId) {
        return { error: "Security validation failed. Section does not belong to the selected program." };
      }
    }

    // 2. Initialize the admin client to bypass RLS for user creation
    // We put this here so if the server lacks the secret key, it will throw immediately before creating partial data.
    const adminClient = createAdminClient();

    // 3. Create the Auth User (Invite flow)
    const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: "student",
      },
      // Safely point back to our site. Defaults to NEXT_PUBLIC_APP_URL.
      redirectTo: process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` 
        : 'http://localhost:3000/auth/callback'
    });

    if (authError) {
      // Handle duplicates cleanly
      if (authError.message.includes("already registered") || authError.status === 422) {
        return { error: "An account with this email already exists." };
      }
      console.error("Auth creation error:", authError);
      return { error: "Failed to create user authentication record." };
    }

    const newUserId = authData.user.id;

    // 4. Update the profile's organization_id since the Auth Trigger 
    // default assigns to the very first organization in the system.
    // The adminClient bypasses RLS to allow this modification immediately.
    const { error: profileUpdateError } = await adminClient
      .from('profiles')
      .update({ organization_id: profile.organization_id })
      .eq('id', newUserId);

    if (profileUpdateError) {
      // Attempt Rollback
      await adminClient.auth.admin.deleteUser(newUserId);
      console.error("Profile sync error:", profileUpdateError);
      return { error: "Failed to sync profile organization. User creation rolled back." };
    }

    // 5. Create student enrollments (one for each section in the batch)
    const enrollments = sectionIds.map(id => ({
      student_id: newUserId,
      section_id: id,
      status: 'active'
    }));

    const { error: enrollmentError } = await adminClient
      .from('student_enrollments')
      .insert(enrollments);

    if (enrollmentError) {
      // Attempt Rollback
      await adminClient.auth.admin.deleteUser(newUserId);
      console.error("Enrollment creation error:", enrollmentError);
      return { error: "Failed to create student enrollment. User creation rolled back." };
    }

    return { success: true, studentId: newUserId };
  } catch (error) {
    console.error("createStudentAction caught error:", error);
    if (error.message.includes('SUPABASE_SECRET_KEY')) {
       return { error: "Server infrastructure missing privileged credentials to create users." };
    }
    return { error: "An unexpected error occurred during user creation." };
  }
}

export async function toggleStudentActivationAction(studentId, activate = true) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const adminClient = createAdminClient();

    // 1. Verify ownership via RLS-enabled regular client first
    const supabase = await createClient();
    const { data: student, error: fetchError } = await supabase
      .from('profiles')
      .select('id, organization_id')
      .eq('id', studentId)
      .single();

    if (fetchError || !student || student.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Student does not belong to your organization." };
    }

    // 2. Update profile is_active
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ is_active: activate })
      .eq('id', studentId);

    if (updateError) {
      console.error("Profile activation error:", updateError);
      return { error: "Failed to update student profile status." };
    }

    // 3. Update Supabase Auth layer (Ban / Unban)
    // Supabase ban functionality works by setting ban_duration.
    // If activate = false, ban for 100 years. If true, remove ban.
    if (activate) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(studentId, { ban_duration: 'none' });
      if (authError) {
         console.error("Auth unban error:", authError);
         return { error: "Profile status updated, but failed to unban authentication." };
      }
    } else {
      const { error: authError } = await adminClient.auth.admin.updateUserById(studentId, { ban_duration: '876000h' });
      if (authError) {
         console.error("Auth ban error:", authError);
         return { error: "Profile status updated, but failed to ban authentication." };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("toggleStudentActivationAction caught error:", error);
    return { error: "An unexpected error occurred during account status update." };
  }
}

export async function updateEnrollmentStatusAction(enrollmentId, newStatus) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const adminClient = createAdminClient();
    
    // Verify ownership via RLS-enabled regular client
    const supabase = await createClient();
    const { data: enrollment, error: fetchError } = await supabase
      .from('student_enrollments')
      .select('id, profiles!inner(organization_id)')
      .eq('id', enrollmentId)
      .single();

    if (fetchError || !enrollment || enrollment.profiles.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Enrollment does not belong to your organization." };
    }

    if (!['active', 'withdrawn', 'completed'].includes(newStatus)) {
      return { error: "Invalid status." };
    }

    const { error: updateError } = await adminClient
      .from('student_enrollments')
      .update({ status: newStatus })
      .eq('id', enrollmentId);

    if (updateError) {
      console.error("Enrollment status update error:", updateError);
      return { error: "Failed to update enrollment status." };
    }

    return { success: true };
  } catch (error) {
    console.error("updateEnrollmentStatusAction error:", error);
    return { error: "An unexpected error occurred while updating enrollment." };
  }
}

export async function updateStudentAcademicAssignmentAction(studentId, programId, sectionIdsStr) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();
    
    if (!studentId || !programId || !sectionIdsStr) {
      return { error: "Missing required fields." };
    }

    const sectionIds = sectionIdsStr.split(',');

    // 1. Verify student belongs to admin's organization
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', studentId)
      .eq('role', 'student')
      .single();

    if (studentError || !student || student.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Student does not belong to your organization." };
    }

    // 2. Validate that all sections belong to the admin's organization AND the selected program
    const { data: sections, error: sectionError } = await supabase
      .from('sections')
      .select('id, subjects(courses(program_id, programs(departments(organization_id))))')
      .in('id', sectionIds);

    if (sectionError || !sections || sections.length !== sectionIds.length) {
      return { error: "Invalid section selected or you do not have permission to access it." };
    }

    for (const section of sections) {
      const orgId = section.subjects?.courses?.programs?.departments?.organization_id;
      const secProgramId = section.subjects?.courses?.program_id;
      
      if (orgId !== profile.organization_id) {
        return { error: "Security validation failed. Section does not belong to your organization." };
      }
      if (secProgramId !== programId) {
        return { error: "Security validation failed. Section does not belong to the selected program." };
      }
    }

    // 3. Perform database updates (mark old active enrollments as withdrawn, create new ones)
    // We use the regular client here so that the newly added RLS policies enforce organization isolation directly at the DB level.
    
    // Withdraw existing active enrollments
    const { error: withdrawError } = await supabase
      .from('student_enrollments')
      .update({ status: 'withdrawn' })
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (withdrawError) {
      console.error("Failed to withdraw old enrollments:", withdrawError);
      return { error: "Failed to update existing enrollments." };
    }

    // Insert new active enrollments
    const enrollments = sectionIds.map(id => ({
      student_id: studentId,
      section_id: id,
      status: 'active'
    }));

    const { error: insertError } = await supabase
      .from('student_enrollments')
      .insert(enrollments);

    if (insertError) {
      console.error("Failed to insert new enrollments:", insertError);
      return { error: "Failed to assign new academic program and section." };
    }

    return { success: true };
  } catch (error) {
    console.error("updateStudentAcademicAssignmentAction error:", error);
    return { error: "An unexpected error occurred while updating academic assignment." };
  }
}

export async function createFacultyAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();
    
    const email = formData.get("email");
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const employeeId = formData.get("employeeId") || null;
    const departmentId = formData.get("departmentId") || null;
    const designation = formData.get("designation") || null;
    const specialization = formData.get("specialization") || null;
    const phone = formData.get("phone") || null;
    const joiningDate = formData.get("joiningDate") || null;

    if (!email || !firstName || !lastName) {
      return { error: "Missing required fields (Name and Email)." };
    }

    if (departmentId) {
      // Validate department belongs to org
      const { data: dept, error: deptError } = await supabase
        .from('departments')
        .select('organization_id')
        .eq('id', departmentId)
        .single();
      
      if (deptError || dept?.organization_id !== profile.organization_id) {
        return { error: "Security validation failed. Department does not belong to your organization." };
      }
    }

    const adminClient = createAdminClient();

    // 1. Create the Auth User (Invite flow)
    const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: "faculty",
      },
      redirectTo: process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` 
        : 'http://localhost:3000/auth/callback'
    });

    if (authError) {
      if (authError.message.includes("already registered") || authError.status === 422) {
        return { error: "An account with this email already exists." };
      }
      console.error("Auth creation error:", authError);
      return { error: "Failed to create user authentication record." };
    }

    const newUserId = authData.user.id;

    // 2. Update profile organization_id
    const { error: profileUpdateError } = await adminClient
      .from('profiles')
      .update({ organization_id: profile.organization_id })
      .eq('id', newUserId);

    if (profileUpdateError) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return { error: "Failed to sync profile organization. User creation rolled back." };
    }

    // 3. Create faculty profile
    const { error: facultyProfileError } = await supabase
      .from('faculty_profiles')
      .insert({
        id: newUserId,
        department_id: departmentId,
        employee_id: employeeId,
        designation: designation,
        specialization: specialization,
        phone: phone,
        joining_date: joiningDate || null
      });

    if (facultyProfileError) {
      // Don't fully rollback the user because auth is created and we can fix faculty details later,
      // but log it as an error to the user if it's severe, or just handle it. We will log it.
      console.error("Faculty profile creation error:", facultyProfileError);
    }

    return { success: true, facultyId: newUserId };
  } catch (error) {
    console.error("createFacultyAction caught error:", error);
    if (error.message?.includes('SUPABASE_SECRET_KEY')) {
       return { error: "Server infrastructure missing privileged credentials to create users." };
    }
    return { error: "An unexpected error occurred during user creation." };
  }
}

export async function updateFacultyAction(facultyId, formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const employeeId = formData.get("employeeId") || null;
    const departmentId = formData.get("departmentId") || null;
    const designation = formData.get("designation") || null;
    const specialization = formData.get("specialization") || null;
    const phone = formData.get("phone") || null;
    const joiningDate = formData.get("joiningDate") || null;

    if (!firstName || !lastName) {
      return { error: "First name and last name are required." };
    }

    // 1. Verify faculty belongs to org
    const { data: facProfile, error: facProfileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', facultyId)
      .eq('role', 'faculty')
      .single();

    if (facProfileError || facProfile?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Faculty does not belong to your organization." };
    }

    if (departmentId) {
      const { data: dept, error: deptError } = await supabase
        .from('departments')
        .select('organization_id')
        .eq('id', departmentId)
        .single();
      
      if (deptError || dept?.organization_id !== profile.organization_id) {
        return { error: "Security validation failed. Department does not belong to your organization." };
      }
    }

    // 2. Update profiles table (Name)
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName
      })
      .eq('id', facultyId);

    if (updateProfileError) {
      console.error("Profile update error:", updateProfileError);
      return { error: "Failed to update core profile information." };
    }

    // 3. Update or Insert faculty_profiles
    const { error: upsertFacultyError } = await supabase
      .from('faculty_profiles')
      .upsert({
        id: facultyId,
        department_id: departmentId,
        employee_id: employeeId,
        designation: designation,
        specialization: specialization,
        phone: phone,
        joining_date: joiningDate || null,
        updated_at: new Date().toISOString()
      });

    if (upsertFacultyError) {
      console.error("Faculty profile update error:", upsertFacultyError);
      return { error: "Failed to update faculty-specific details." };
    }

    return { success: true };
  } catch (error) {
    console.error("updateFacultyAction error:", error);
    return { error: "An unexpected error occurred while updating the faculty account." };
  }
}

export async function createFacultyAssignmentAction(facultyId, formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const subjectId = formData.get("courseId"); // The UI still calls it course
    
    if (!subjectId) {
      return { error: "Please select a course." };
    }

    // 1. Verify faculty belongs to org
    const { data: facProfile, error: facProfileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', facultyId)
      .eq('role', 'faculty')
      .single();

    if (facProfileError || facProfile?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Faculty does not belong to your organization." };
    }

    // 2. Validate subject belongs to org
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, courses(programs(departments(organization_id)))')
      .eq('id', subjectId)
      .single();

    if (subjectError || !subject) {
      return { error: "Invalid course selected." };
    }

    const orgId = subject.courses?.programs?.departments?.organization_id;
    if (orgId !== profile.organization_id) {
      return { error: "Security validation failed. Course does not belong to your organization." };
    }

    // 3. Insert assignment
    const { error: insertError } = await supabase
      .from('faculty_assignments')
      .insert({
        faculty_id: facultyId,
        subject_id: subjectId,
        is_primary: true
      });

    if (insertError) {
      // 23505 is unique violation in postgres
      if (insertError.code === '23505') {
        return { error: "This faculty member is already assigned to this course." };
      }
      console.error("Faculty assignment creation error:", insertError);
      return { error: "Failed to assign course." };
    }

    return { success: true };
  } catch (error) {
    console.error("createFacultyAssignmentAction error:", error);
    return { error: "An unexpected error occurred while creating teaching assignment." };
  }
}

export async function deleteFacultyAssignmentAction(assignmentId) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    // Verify assignment belongs to org
    const { data: assignment, error: fetchError } = await supabase
      .from('faculty_assignments')
      .select('id, subjects(courses(programs(departments(organization_id))))')
      .eq('id', assignmentId)
      .single();

    if (fetchError || !assignment) {
      return { error: "Assignment not found." };
    }

    const orgId = assignment.subjects?.courses?.programs?.departments?.organization_id;
    if (orgId !== profile.organization_id) {
      return { error: "Security validation failed. Cannot remove assignment outside your organization." };
    }

    const { error: deleteError } = await supabase
      .from('faculty_assignments')
      .delete()
      .eq('id', assignmentId);

    if (deleteError) {
      console.error("Faculty assignment delete error:", deleteError);
      return { error: "Failed to remove teaching assignment." };
    }

    return { success: true };
  } catch (error) {
    console.error("deleteFacultyAssignmentAction error:", error);
    return { error: "An unexpected error occurred while removing teaching assignment." };
  }
}



