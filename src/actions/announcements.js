"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getProgramsAndSections() {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  const [programsRes, sectionsRes] = await Promise.all([
    supabase
      .from("programs")
      .select("id, name, departments!inner(organization_id)")
      .eq("departments.organization_id", profile.organization_id),
    supabase
      .from("sections")
      .select(`
        id, name,
        subjects!inner (
          courses!inner (
            program_id,
            programs!inner (
              departments!inner (
                organization_id
              )
            )
          )
        )
      `)
      .eq("subjects.courses.programs.departments.organization_id", profile.organization_id)
  ]);

  const formattedPrograms = programsRes.data?.map(p => ({
    id: p.id,
    name: p.name
  })) || [];

  const formattedSections = sectionsRes.data?.map(s => ({
    id: s.id,
    name: s.name,
    program_id: s.subjects?.courses?.program_id
  })) || [];

  return {
    programs: formattedPrograms,
    sections: formattedSections
  };
}

export async function getAdminAnnouncementStatistics() {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .select("status")
    .eq("organization_id", profile.organization_id);

  if (error) {
    return { total: 0, published: 0, scheduled: 0, draft: 0 };
  }

  return {
    total: data.length,
    published: data.filter(a => a.status === 'published').length,
    scheduled: data.filter(a => a.status === 'scheduled').length,
    draft: data.filter(a => a.status === 'draft').length
  };
}

export async function getAdminAnnouncements({ search = "", audience = "", status = "" }) {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  let query = supabase
    .from("announcements")
    .select(`
      id, title, message, audience_type, status, published_at, scheduled_at, created_at,
      program:programs(id, name),
      section:sections(id, name),
      author:profiles!created_by(first_name, last_name)
    `)
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
  }
  if (audience && audience !== "all") {
    query = query.eq("audience_type", audience);
  }
  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
  return data;
}

export async function getAdminAnnouncementDetails(id) {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .select(`
      id, title, message, audience_type, status, published_at, scheduled_at, created_at, program_id, section_id,
      program:programs(id, name),
      section:sections(id, name),
      author:profiles!created_by(first_name, last_name)
    `)
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function createAnnouncementAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const title = formData.get("title");
    const message = formData.get("message");
    const audience_type = formData.get("audience_type");
    const program_id = formData.get("program_id") || null;
    const section_id = formData.get("section_id") || null;
    const publishOption = formData.get("publish_option"); // 'now', 'later', 'draft'
    
    if (!title || !message || !audience_type || !publishOption) {
      return { error: "Missing required fields." };
    }

    if (audience_type === "specific_program" && !program_id) {
      return { error: "Program is required for specific program audience." };
    }
    if (audience_type === "specific_section" && (!program_id || !section_id)) {
      return { error: "Program and Section are required for specific section audience." };
    }

    if (audience_type === "specific_program") {
      const { data: programData, error: programError } = await supabase
        .from("programs")
        .select("id, departments!inner(organization_id)")
        .eq("id", program_id)
        .eq("departments.organization_id", profile.organization_id)
        .single();
        
      if (programError || !programData) {
        return { error: "Invalid program selected or unauthorized." };
      }
    }

    if (audience_type === "specific_section") {
      const { data: sectionData, error: sectionError } = await supabase
        .from("sections")
        .select(`
          id,
          subjects!inner (
            courses!inner (
              program_id,
              programs!inner (
                departments!inner (
                  organization_id
                )
              )
            )
          )
        `)
        .eq("id", section_id)
        .eq("subjects.courses.programs.departments.organization_id", profile.organization_id)
        .eq("subjects.courses.program_id", program_id)
        .single();
        
      if (sectionError || !sectionData) {
        return { error: "Invalid section selected or unauthorized." };
      }
    }

    let status = 'draft';
    let published_at = null;
    let scheduled_at = null;

    if (publishOption === "now") {
      status = 'published';
      published_at = new Date().toISOString();
    } else if (publishOption === "later") {
      status = 'scheduled';
      const date = formData.get("scheduled_date");
      const time = formData.get("scheduled_time");
      if (!date || !time) return { error: "Schedule date and time are required." };
      scheduled_at = new Date(`${date}T${time}`).toISOString();
      if (new Date(scheduled_at) <= new Date()) {
        return { error: "Scheduled time must be in the future." };
      }
    }

    const payload = {
      organization_id: profile.organization_id,
      title,
      message,
      audience_type,
      program_id: audience_type === "specific_program" || audience_type === "specific_section" ? program_id : null,
      section_id: audience_type === "specific_section" ? section_id : null,
      status,
      published_at,
      scheduled_at,
      created_by: profile.id
    };

    const { data, error } = await supabase
      .from("announcements")
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      console.error(error);
      return { error: "Failed to create announcement." };
    }

    revalidatePath("/admin/announcements");
    return { success: true, id: data.id };
  } catch (error) {
    console.error(error);
    return { error: "An unexpected error occurred." };
  }
}

export async function updateAnnouncementAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const id = formData.get("id");
    const title = formData.get("title");
    const message = formData.get("message");
    const audience_type = formData.get("audience_type");
    const program_id = formData.get("program_id") || null;
    const section_id = formData.get("section_id") || null;
    const publishOption = formData.get("publish_option"); 

    if (!id || !title || !message || !audience_type) {
      return { error: "Missing required fields." };
    }

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from("announcements")
      .select("id")
      .eq("id", id)
      .eq("organization_id", profile.organization_id)
      .single();

    if (fetchErr || !existing) return { error: "Announcement not found or unauthorized." };

    if (audience_type === "specific_program") {
      const { data: programData, error: programError } = await supabase
        .from("programs")
        .select("id, departments!inner(organization_id)")
        .eq("id", program_id)
        .eq("departments.organization_id", profile.organization_id)
        .single();
        
      if (programError || !programData) {
        return { error: "Invalid program selected or unauthorized." };
      }
    }

    if (audience_type === "specific_section") {
      const { data: sectionData, error: sectionError } = await supabase
        .from("sections")
        .select(`
          id,
          subjects!inner (
            courses!inner (
              program_id,
              programs!inner (
                departments!inner (
                  organization_id
                )
              )
            )
          )
        `)
        .eq("id", section_id)
        .eq("subjects.courses.programs.departments.organization_id", profile.organization_id)
        .eq("subjects.courses.program_id", program_id)
        .single();
        
      if (sectionError || !sectionData) {
        return { error: "Invalid section selected or unauthorized." };
      }
    }

    let status = 'draft';
    let published_at = null;
    let scheduled_at = null;

    if (publishOption === "now") {
      status = 'published';
      published_at = new Date().toISOString();
    } else if (publishOption === "later") {
      status = 'scheduled';
      const date = formData.get("scheduled_date");
      const time = formData.get("scheduled_time");
      if (!date || !time) return { error: "Schedule date and time are required." };
      scheduled_at = new Date(`${date}T${time}`).toISOString();
      if (new Date(scheduled_at) <= new Date()) {
        return { error: "Scheduled time must be in the future." };
      }
    }

    const payload = {
      title,
      message,
      audience_type,
      program_id: audience_type === "specific_program" || audience_type === "specific_section" ? program_id : null,
      section_id: audience_type === "specific_section" ? section_id : null,
      status,
      published_at,
      scheduled_at
    };

    const { error } = await supabase
      .from("announcements")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error(error);
      return { error: "Failed to update announcement." };
    }

    revalidatePath("/admin/announcements");
    revalidatePath(`/admin/announcements/${id}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteAnnouncementAction(id) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id)
      .eq("organization_id", profile.organization_id);

    if (error) {
      console.error(error);
      return { error: "Failed to delete announcement." };
    }

    revalidatePath("/admin/announcements");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An unexpected error occurred." };
  }
}
