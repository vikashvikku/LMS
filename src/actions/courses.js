"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createCourseAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const title = formData.get("title");
    const code = formData.get("code");
    const programId = formData.get("program_id");
    const semester = parseInt(formData.get("semester"), 10) || 1;
    const credits = parseInt(formData.get("credits"), 10) || 3;
    const type = formData.get("type") || "Core";
    const isActive = formData.get("is_active") === "true";

    if (!title || !code || !programId) {
      return { error: "Missing required fields." };
    }

    // 1. Verify program and org
    const { data: program, error: fetchError } = await supabase
      .from('programs')
      .select('departments(organization_id)')
      .eq('id', programId)
      .single();

    if (fetchError || program?.departments?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Program not found or unauthorized." };
    }

    // 2. Check duplicate code
    const { data: existing } = await supabase
      .from('subjects')
      .select('id')
      .eq('code', code)
      .single();

    if (existing) {
      return { error: "A course with this code already exists." };
    }

    // 3. Resolve a cohort (course_id) for this program
    // We need to link the subject to an existing cohort in the program.
    const { data: cohorts, error: cohortsError } = await supabase
      .from('courses')
      .select('id')
      .eq('program_id', programId)
      .limit(1);

    let courseId;
    if (!cohorts || cohorts.length === 0) {
      // Create a default cohort for this program
      const { data: newCohort, error: insertCohortError } = await supabase
        .from('courses')
        .insert({
          program_id: programId,
          title: "General Cohort",
          code: `COHORT-${Math.floor(Math.random() * 10000)}`,
          credits: 120
        })
        .select('id')
        .single();
        
      if (insertCohortError) {
        return { error: "Failed to initialize program cohort." };
      }
      courseId = newCohort.id;
    } else {
      courseId = cohorts[0].id;
    }

    // 4. Create the subject
    const { error: insertError } = await supabase
      .from('subjects')
      .insert({
        course_id: courseId,
        title,
        code,
        semester,
        credits,
        type,
        is_active: isActive
      });

    if (insertError) {
      console.error("Course creation error:", insertError);
      return { error: "Failed to create course." };
    }

    revalidatePath("/admin/courses");
    revalidatePath("/admin/programs");
    revalidatePath(`/admin/programs/${programId}`);
    return { success: true };
  } catch (error) {
    console.error("createCourseAction error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function updateCourseAction(subjectId, formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const title = formData.get("title");
    const code = formData.get("code");
    const programId = formData.get("program_id");
    const semester = parseInt(formData.get("semester"), 10) || 1;
    const credits = parseInt(formData.get("credits"), 10) || 3;
    const type = formData.get("type") || "Core";
    const isActive = formData.get("is_active") === "true";

    // 1. Verify subject and org
    const { data: subject, error: fetchError } = await supabase
      .from('subjects')
      .select('courses!inner(programs!inner(departments!inner(organization_id)))')
      .eq('id', subjectId)
      .single();

    if (fetchError || subject?.courses?.programs?.departments?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Course not found or unauthorized." };
    }

    // 2. Check duplicate code
    const { data: existing } = await supabase
      .from('subjects')
      .select('id')
      .eq('code', code)
      .neq('id', subjectId)
      .single();

    if (existing) {
      return { error: "Another course with this code already exists." };
    }

    // 3. Resolve cohort if program changed
    let updatePayload = {
      title,
      code,
      semester,
      credits,
      type,
      is_active: isActive,
      updated_at: new Date().toISOString()
    };

    if (programId) {
      const { data: cohorts } = await supabase
        .from('courses')
        .select('id')
        .eq('program_id', programId)
        .limit(1);

      if (cohorts && cohorts.length > 0) {
        updatePayload.course_id = cohorts[0].id;
      }
    }

    const { error: updateError } = await supabase
      .from('subjects')
      .update(updatePayload)
      .eq('id', subjectId);

    if (updateError) {
      console.error("Course update error:", updateError);
      return { error: "Failed to update course." };
    }

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${subjectId}`);
    return { success: true };
  } catch (error) {
    console.error("updateCourseAction error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function toggleCourseStatusAction(subjectId, isActive) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    // Verify course and org
    const { data: subject, error: fetchError } = await supabase
      .from('subjects')
      .select('courses!inner(programs!inner(departments!inner(organization_id)))')
      .eq('id', subjectId)
      .single();

    if (fetchError || subject?.courses?.programs?.departments?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Course not found or unauthorized." };
    }

    const { error: updateError } = await supabase
      .from('subjects')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', subjectId);

    if (updateError) {
      console.error("Course status update error:", updateError);
      return { error: "Failed to change course status." };
    }

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${subjectId}`);
    return { success: true };
  } catch (error) {
    console.error("toggleCourseStatusAction error:", error);
    return { error: "An unexpected error occurred." };
  }
}
