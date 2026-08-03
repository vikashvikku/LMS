"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createSectionAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const name = formData.get("name");
    const code = formData.get("code") || null;
    const subjectId = formData.get("subject_id");
    const semesterId = formData.get("semester_id");
    const capacity = parseInt(formData.get("capacity"), 10) || 60;
    const isActive = formData.get("is_active") === "true";

    if (!name || !subjectId || !semesterId) {
      return { error: "Missing required fields." };
    }

    // Verify org
    const { data: subject, error: fetchError } = await supabase
      .from('subjects')
      .select('courses!inner(programs!inner(departments!inner(organization_id)))')
      .eq('id', subjectId)
      .single();

    if (fetchError || subject?.courses?.programs?.departments?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Course not found or unauthorized." };
    }

    const { error: insertError } = await supabase
      .from('sections')
      .insert({
        name,
        code,
        subject_id: subjectId,
        semester_id: semesterId,
        capacity,
        is_active: isActive
      });

    if (insertError) {
      console.error("Section creation error:", insertError);
      return { error: "Failed to create section. Ensure section name is unique for this subject and semester." };
    }

    revalidatePath("/admin/sections");
    revalidatePath(`/admin/courses/${subjectId}`);
    return { success: true };
  } catch (error) {
    console.error("createSectionAction error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function updateSectionAction(sectionId, formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const name = formData.get("name");
    const code = formData.get("code") || null;
    const capacity = parseInt(formData.get("capacity"), 10) || 60;
    const isActive = formData.get("is_active") === "true";

    // Verify org
    const { data: section, error: fetchError } = await supabase
      .from('sections')
      .select('subjects!inner(courses!inner(programs!inner(departments!inner(organization_id))))')
      .eq('id', sectionId)
      .single();

    if (fetchError || section?.subjects?.courses?.programs?.departments?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Section not found or unauthorized." };
    }

    const { error: updateError } = await supabase
      .from('sections')
      .update({
        name,
        code,
        capacity,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId);

    if (updateError) {
      console.error("Section update error:", updateError);
      return { error: "Failed to update section." };
    }

    revalidatePath("/admin/sections");
    revalidatePath(`/admin/sections/${sectionId}`);
    return { success: true };
  } catch (error) {
    console.error("updateSectionAction error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function toggleSectionStatusAction(sectionId, isActive) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const { data: section, error: fetchError } = await supabase
      .from('sections')
      .select('subjects!inner(courses!inner(programs!inner(departments!inner(organization_id))))')
      .eq('id', sectionId)
      .single();

    if (fetchError || section?.subjects?.courses?.programs?.departments?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed." };
    }

    const { error: updateError } = await supabase
      .from('sections')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId);

    if (updateError) {
      return { error: "Failed to change section status." };
    }

    revalidatePath("/admin/sections");
    revalidatePath(`/admin/sections/${sectionId}`);
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}

export async function assignStudentToSectionAction(sectionId, studentId) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    // Verify section org and capacity
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('capacity, subjects!inner(courses!inner(programs!inner(departments!inner(organization_id))))')
      .eq('id', sectionId)
      .single();

    if (sectionError || section?.subjects?.courses?.programs?.departments?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Section not found or unauthorized." };
    }

    const { count: activeCount } = await supabase
      .from('student_enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('section_id', sectionId)
      .eq('status', 'active');

    if (activeCount >= section.capacity) {
      return { error: "Section is at maximum capacity." };
    }

    // Upsert or insert enrollment
    const { error: enrollError } = await supabase
      .from('student_enrollments')
      .insert({
        student_id: studentId,
        section_id: sectionId,
        status: 'active'
      });

    if (enrollError) {
      // If it's a unique constraint violation, they might already be enrolled.
      if (enrollError.code === '23505') {
        // Just update status to active if they were withdrawn
        await supabase.from('student_enrollments')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('student_id', studentId)
          .eq('section_id', sectionId);
      } else {
        console.error("Assignment error:", enrollError);
        return { error: "Failed to assign student. " + enrollError.message };
      }
    }

    revalidatePath(`/admin/sections/${sectionId}`);
    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    console.error("assignStudent error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function removeStudentFromSectionAction(enrollmentId, sectionId) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    // Verify section org
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('subjects!inner(courses!inner(programs!inner(departments!inner(organization_id))))')
      .eq('id', sectionId)
      .single();

    if (sectionError || section?.subjects?.courses?.programs?.departments?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed." };
    }

    const { error } = await supabase
      .from('student_enrollments')
      .delete()
      .eq('id', enrollmentId)
      .eq('section_id', sectionId);

    if (error) {
      return { error: "Failed to remove student." };
    }

    revalidatePath(`/admin/sections/${sectionId}`);
    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}

export async function moveStudentSectionAction(enrollmentId, currentSectionId, newSectionId) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    // Verify new section org and capacity
    const { data: newSection, error: sectionError } = await supabase
      .from('sections')
      .select('capacity, subjects!inner(courses!inner(programs!inner(departments!inner(organization_id))))')
      .eq('id', newSectionId)
      .single();

    if (sectionError || newSection?.subjects?.courses?.programs?.departments?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed for the destination section." };
    }

    const { count: activeCount } = await supabase
      .from('student_enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('section_id', newSectionId)
      .eq('status', 'active');

    if (activeCount >= newSection.capacity) {
      return { error: "Destination section is at maximum capacity." };
    }

    const { error } = await supabase
      .from('student_enrollments')
      .update({ section_id: newSectionId, updated_at: new Date().toISOString() })
      .eq('id', enrollmentId)
      .eq('section_id', currentSectionId);

    if (error) {
      // Might violate unique constraint if they somehow have an inactive enrollment in the new section
      if (error.code === '23505') {
        return { error: "Student already has a historical record in the destination section." };
      }
      return { error: "Failed to move student." };
    }

    revalidatePath(`/admin/sections/${currentSectionId}`);
    revalidatePath(`/admin/sections/${newSectionId}`);
    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}
