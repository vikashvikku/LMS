"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createProgramAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const name = formData.get("name");
    const code = formData.get("code");
    const type = formData.get("type") || "Undergraduate";
    const departmentId = formData.get("department_id");
    const duration = parseInt(formData.get("duration"), 10) || 4;
    const durationUnit = formData.get("duration_unit") || "Years";
    const description = formData.get("description") || null;
    const isActive = formData.get("is_active") === "true";

    if (!name || !code || !departmentId) {
      return { error: "Missing required fields." };
    }

    // Security check: Verify department belongs to the admin's organization
    const { data: dept, error: deptError } = await supabase
      .from('departments')
      .select('organization_id')
      .eq('id', departmentId)
      .single();

    if (deptError || dept?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Department not found or does not belong to your organization." };
    }

    // Check for duplicate code within the organization
    const { data: existing, error: existError } = await supabase
      .from('programs')
      .select('id')
      .eq('code', code)
      .eq('department_id', departmentId)
      .single();

    if (existing) {
      return { error: "A program with this code already exists in this department." };
    }

    const { error: insertError } = await supabase
      .from('programs')
      .insert({
        name,
        code,
        type,
        department_id: departmentId,
        duration,
        duration_unit: durationUnit,
        description,
        is_active: isActive
      });

    if (insertError) {
      console.error("Program creation error:", insertError);
      return { error: "Failed to create program." };
    }

    revalidatePath("/admin/programs");
    return { success: true };
  } catch (error) {
    console.error("createProgramAction error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function updateProgramAction(programId, formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const name = formData.get("name");
    const code = formData.get("code");
    const type = formData.get("type");
    const departmentId = formData.get("department_id");
    const duration = parseInt(formData.get("duration"), 10);
    const durationUnit = formData.get("duration_unit");
    const description = formData.get("description");
    const isActive = formData.get("is_active") === "true";

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
      .from('programs')
      .select('id')
      .eq('code', code)
      .eq('department_id', departmentId)
      .neq('id', programId)
      .single();

    if (existing) {
      return { error: "Another program with this code already exists in this department." };
    }

    const { error: updateError } = await supabase
      .from('programs')
      .update({
        name,
        code,
        type,
        department_id: departmentId,
        duration,
        duration_unit: durationUnit,
        description,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', programId);

    if (updateError) {
      console.error("Program update error:", updateError);
      return { error: "Failed to update program." };
    }

    revalidatePath("/admin/programs");
    revalidatePath(`/admin/programs/${programId}`);
    return { success: true };
  } catch (error) {
    console.error("updateProgramAction error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function toggleProgramStatusAction(programId, isActive) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    // Verify program and org
    const { data: program, error: fetchError } = await supabase
      .from('programs')
      .select('departments(organization_id)')
      .eq('id', programId)
      .single();

    if (fetchError || program?.departments?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Program not found or unauthorized." };
    }

    const { error: updateError } = await supabase
      .from('programs')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', programId);

    if (updateError) {
      console.error("Program status update error:", updateError);
      return { error: "Failed to change program status." };
    }

    revalidatePath("/admin/programs");
    revalidatePath(`/admin/programs/${programId}`);
    return { success: true };
  } catch (error) {
    console.error("toggleProgramStatusAction error:", error);
    return { error: "An unexpected error occurred." };
  }
}
