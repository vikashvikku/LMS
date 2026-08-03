"use server";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ----------------------------------------------------------------------
// Organization Profile
// ----------------------------------------------------------------------

export async function updateOrganizationProfileAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const name = formData.get("name");
    const code = formData.get("code") || null;
    const email = formData.get("email") || null;
    const phone = formData.get("phone") || null;
    const website = formData.get("website") || null;
    const address = formData.get("address") || null;
    const city = formData.get("city") || null;
    const state = formData.get("state") || null;
    const country = formData.get("country") || null;
    const postalCode = formData.get("postal_code") || null;
    const timezone = formData.get("timezone") || "UTC";

    if (!name) return { error: "Organization Name is required." };

    const { error } = await supabase
      .from("organizations")
      .update({
        name,
        code,
        email,
        phone,
        website,
        address,
        city,
        state,
        country,
        postal_code: postalCode,
        timezone,
      })
      .eq("id", profile.organization_id);

    if (error) {
      console.error("Organization profile update error:", error);
      return { error: "Failed to update organization profile." };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/organization");
    return { success: true };
  } catch (err) {
    console.error("updateOrganizationProfileAction:", err);
    return { error: "An unexpected error occurred." };
  }
}

// ----------------------------------------------------------------------
// Academic Settings
// ----------------------------------------------------------------------

export async function createAcademicYearAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const name = formData.get("name");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    
    if (!name || !startDate || !endDate) return { error: "All fields are required." };

    const { error } = await supabase.from("academic_years").insert({
      organization_id: profile.organization_id,
      name,
      start_date: startDate,
      end_date: endDate,
    });

    if (error) {
      console.error("Create academic year error:", error);
      return { error: "Failed to create academic year." };
    }

    revalidatePath("/admin/settings/academic");
    return { success: true };
  } catch (err) {
    console.error("createAcademicYearAction error:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function activateAcademicYearAction(id) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    // Verify it belongs to org
    const { data: ay, error: fetchErr } = await supabase
      .from("academic_years")
      .select("id")
      .eq("id", id)
      .eq("organization_id", profile.organization_id)
      .single();

    if (fetchErr || !ay) return { error: "Academic year not found." };

    // Deactivate all
    await supabase.from("academic_years")
      .update({ is_active: false })
      .eq("organization_id", profile.organization_id);

    // Activate selected
    const { error } = await supabase.from("academic_years")
      .update({ is_active: true })
      .eq("id", id);

    if (error) {
      console.error("Activate academic year error:", error);
      return { error: "Failed to activate academic year." };
    }

    revalidatePath("/admin/settings/academic");
    return { success: true };
  } catch (err) {
    console.error("activateAcademicYearAction error:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function createSemesterAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const academicYearId = formData.get("academicYearId");
    const name = formData.get("name");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");

    if (!academicYearId || !name || !startDate || !endDate) {
      return { error: "All fields are required." };
    }

    // Verify academic year belongs to org
    const { data: ay, error: fetchErr } = await supabase
      .from("academic_years")
      .select("id")
      .eq("id", academicYearId)
      .eq("organization_id", profile.organization_id)
      .single();

    if (fetchErr || !ay) return { error: "Academic year not found or unauthorized." };

    const { error } = await supabase.from("semesters").insert({
      academic_year_id: academicYearId,
      name,
      start_date: startDate,
      end_date: endDate,
    });

    if (error) {
      console.error("Create semester error:", error);
      return { error: "Failed to create semester." };
    }

    revalidatePath("/admin/settings/academic");
    return { success: true };
  } catch (err) {
    console.error("createSemesterAction error:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function activateSemesterAction(id) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    // Get semester and its academic year to verify org
    const { data: semester, error: fetchErr } = await supabase
      .from("semesters")
      .select("id, academic_year_id, academic_years(organization_id)")
      .eq("id", id)
      .single();

    if (fetchErr || semester.academic_years.organization_id !== profile.organization_id) {
      return { error: "Semester not found or unauthorized." };
    }

    // Get all semesters for this organization (to deactivate them)
    const { data: ayList } = await supabase
      .from("academic_years")
      .select("id")
      .eq("organization_id", profile.organization_id);

    const ayIds = (ayList || []).map((ay) => ay.id);
    if (ayIds.length > 0) {
      const { data: allSemesters } = await supabase
        .from("semesters")
        .select("id")
        .in("academic_year_id", ayIds);

      if (allSemesters && allSemesters.length > 0) {
        await supabase.from("semesters")
          .update({ is_active: false })
          .in("id", allSemesters.map(s => s.id));
      }
    }

    // Activate the chosen one
    const { error } = await supabase.from("semesters")
      .update({ is_active: true })
      .eq("id", id);

    if (error) {
      console.error("Activate semester error:", error);
      return { error: "Failed to activate semester." };
    }

    revalidatePath("/admin/settings/academic");
    return { success: true };
  } catch (err) {
    console.error("activateSemesterAction error:", err);
    return { error: "An unexpected error occurred." };
  }
}

// ----------------------------------------------------------------------
// Department Management
// ----------------------------------------------------------------------

export async function createDepartmentAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const name = formData.get("name");
    const code = formData.get("code");
    const description = formData.get("description") || null;
    const isActive = formData.get("isActive") === "true";

    if (!name || !code) return { error: "Name and code are required." };

    const { error } = await supabase.from("departments").insert({
      organization_id: profile.organization_id,
      name,
      code,
      description,
      is_active: isActive,
    });

    if (error) {
      if (error.code === "23505") return { error: "Department code must be unique." };
      console.error("Create department error:", error);
      return { error: "Failed to create department." };
    }

    revalidatePath("/admin/settings/departments");
    return { success: true };
  } catch (err) {
    console.error("createDepartmentAction error:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function updateDepartmentAction(id, formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const name = formData.get("name");
    const code = formData.get("code");
    const description = formData.get("description") || null;
    const isActive = formData.get("isActive") === "true";

    if (!name || !code) return { error: "Name and code are required." };

    // verify ownership
    const { data: dept, error: fetchErr } = await supabase
      .from("departments")
      .select("id")
      .eq("id", id)
      .eq("organization_id", profile.organization_id)
      .single();

    if (fetchErr || !dept) return { error: "Department not found." };

    const { error } = await supabase.from("departments").update({
      name,
      code,
      description,
      is_active: isActive,
    }).eq("id", id);

    if (error) {
      if (error.code === "23505") return { error: "Department code must be unique." };
      console.error("Update department error:", error);
      return { error: "Failed to update department." };
    }

    revalidatePath("/admin/settings/departments");
    return { success: true };
  } catch (err) {
    console.error("updateDepartmentAction error:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteDepartmentAction(id) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    // Verify ownership
    const { data: dept, error: fetchErr } = await supabase
      .from("departments")
      .select("id")
      .eq("id", id)
      .eq("organization_id", profile.organization_id)
      .single();

    if (fetchErr || !dept) return { error: "Department not found." };

    const { error } = await supabase.from("departments").delete().eq("id", id);

    if (error) {
      // 23503 is foreign_key_violation
      if (error.code === "23503") return { error: "Cannot delete department because it is referenced by existing programs." };
      console.error("Delete department error:", error);
      return { error: "Failed to delete department." };
    }

    revalidatePath("/admin/settings/departments");
    return { success: true };
  } catch (err) {
    console.error("deleteDepartmentAction error:", err);
    return { error: "An unexpected error occurred." };
  }
}

// ----------------------------------------------------------------------
// User & Role Management
// ----------------------------------------------------------------------

export async function updateUserRoleAction(userId, newRole) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    if (userId === profile.id) return { error: "You cannot change your own role." };

    const { data: user, error: fetchErr } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .single();

    if (fetchErr || user.organization_id !== profile.organization_id) {
      return { error: "User not found." };
    }

    // Role update requires admin client to bypass RLS potentially, or standard client if policy allows.
    // Assuming policy allows university_admin to update profiles in their org.
    const { error } = await supabase.from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error("Update role error:", error);
      return { error: "Failed to update user role." };
    }

    revalidatePath("/admin/settings/users");
    return { success: true };
  } catch (err) {
    console.error("updateUserRoleAction error:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function toggleUserStatusAction(userId, isActive) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    
    if (userId === profile.id) return { error: "You cannot disable your own account." };

    const supabase = await createClient();
    const adminClient = createAdminClient();

    const { data: user, error: fetchErr } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .single();

    if (fetchErr || user.organization_id !== profile.organization_id) {
      return { error: "User not found." };
    }

    // Profile update
    const { error: profileErr } = await supabase.from("profiles")
      .update({ is_active: isActive })
      .eq("id", userId);

    if (profileErr) return { error: "Failed to update profile status." };

    // Auth ban logic
    if (isActive) {
      await adminClient.auth.admin.updateUserById(userId, { ban_duration: 'none' });
    } else {
      await adminClient.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
    }

    revalidatePath("/admin/settings/users");
    return { success: true };
  } catch (err) {
    console.error("toggleUserStatusAction error:", err);
    return { error: "An unexpected error occurred." };
  }
}

// ----------------------------------------------------------------------
// Preferences and Branding
// ----------------------------------------------------------------------

export async function updateNotificationPreferencesAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const notification_email = formData.get("notification_email") === "true";
    const notification_announcements = formData.get("notification_announcements") === "true";
    const notification_fees = formData.get("notification_fees") === "true";
    const notification_students = formData.get("notification_students") === "true";

    const { error } = await supabase.from("organization_settings")
      .upsert({
        organization_id: profile.organization_id,
        notification_email,
        notification_announcements,
        notification_fees,
        notification_students
      }, { onConflict: "organization_id" });

    if (error) {
      console.error("Update notifications error:", error);
      return { error: "Failed to update preferences." };
    }

    revalidatePath("/admin/settings/notifications");
    return { success: true };
  } catch (err) {
    console.error("updateNotificationPreferencesAction error:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function updateBrandingSettingsAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const primaryColor = formData.get("primary_color");
    const secondaryColor = formData.get("secondary_color");
    const logoUrl = formData.get("logo_url"); // URL if uploaded

    // Upsert into organization_settings
    const { error } = await supabase.from("organization_settings")
      .upsert({
        organization_id: profile.organization_id,
        branding_primary_color: primaryColor,
        branding_secondary_color: secondaryColor,
        branding_logo_url: logoUrl
      }, { onConflict: "organization_id" });

    if (error) {
      console.error("Update branding error:", error);
      return { error: "Failed to update branding settings." };
    }

    // Also sync logo URL to organizations for easier access globally
    await supabase.from("organizations")
      .update({ logo_url: logoUrl })
      .eq("id", profile.organization_id);

    revalidatePath("/admin/settings/branding");
    return { success: true };
  } catch (err) {
    console.error("updateBrandingSettingsAction error:", err);
    return { error: "An unexpected error occurred." };
  }
}
