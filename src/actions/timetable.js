"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function checkTimetableConflicts(supabase, { dayOfWeek, startTime, endTime, facultyId, sectionId, roomId, excludeId = null }) {
  // Query existing entries for the same day that overlap in time
  let query = supabase
    .from('timetable_entries')
    .select(`
      id, faculty_id, section_id, room_id, start_time, end_time,
      faculty:profiles(id, first_name, last_name),
      sections(name, subjects(title)),
      rooms(name)
    `)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data: entries, error } = await query;
  
  if (error) {
    throw new Error("Failed to check conflicts.");
  }

  const newStart = new Date(`1970-01-01T${startTime}`);
  const newEnd = new Date(`1970-01-01T${endTime}`);

  for (const entry of entries) {
    const existingStart = new Date(`1970-01-01T${entry.start_time}`);
    const existingEnd = new Date(`1970-01-01T${entry.end_time}`);

    // Check overlap: newStart < existingEnd AND newEnd > existingStart
    if (newStart < existingEnd && newEnd > existingStart) {
      if (entry.faculty_id === facultyId) {
        return `Scheduling Conflict: Faculty ${entry.faculty?.first_name} ${entry.faculty?.last_name} is already assigned to ${entry.sections?.subjects?.title} (${entry.sections?.name}) during this time.`;
      }
      if (entry.section_id === sectionId) {
        return `Scheduling Conflict: Section ${entry.sections?.name} already has a class scheduled during this time.`;
      }
      if (entry.room_id === roomId) {
        return `Scheduling Conflict: Room ${entry.rooms?.name || 'selected'} is already occupied by ${entry.sections?.subjects?.title} (${entry.sections?.name}) during this time.`;
      }
    }
  }

  return null; // No conflicts
}

export async function createTimetableAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const sectionId = formData.get("section_id");
    const facultyId = formData.get("faculty_id");
    const roomId = formData.get("room_id");
    const dayOfWeek = parseInt(formData.get("day_of_week"), 10);
    const startTime = formData.get("start_time");
    const endTime = formData.get("end_time");
    const classType = formData.get("class_type") || "Lecture";
    const isActive = formData.get("is_active") === "true";

    if (!sectionId || !facultyId || !roomId || isNaN(dayOfWeek) || !startTime || !endTime) {
      return { error: "Missing required fields." };
    }

    if (startTime >= endTime) {
      return { error: "Start time must be before end time." };
    }

    // Verify org authorization via section
    const { data: section, error: secError } = await supabase
      .from('sections')
      .select('subjects!inner(courses!inner(programs!inner(departments!inner(organization_id))))')
      .eq('id', sectionId)
      .single();

    if (secError || section?.subjects?.courses?.programs?.departments?.organization_id !== profile.organization_id) {
      return { error: "Security validation failed. Section not found or unauthorized." };
    }

    // Check conflicts
    const conflictMsg = await checkTimetableConflicts(supabase, {
      dayOfWeek, startTime, endTime, facultyId, sectionId, roomId
    });

    if (conflictMsg) {
      return { error: conflictMsg };
    }

    const courseId = formData.get("course_id");

    if (courseId) {
      const { data: existingAssignment } = await supabase
        .from('faculty_assignments')
        .select('id')
        .eq('faculty_id', facultyId)
        .eq('subject_id', courseId)
        .maybeSingle();
        
      if (!existingAssignment) {
        await supabase
          .from('faculty_assignments')
          .insert({
            faculty_id: facultyId,
            subject_id: courseId,
            is_primary: false
          });
      }
    }

    const { error: insertError } = await supabase
      .from('timetable_entries')
      .insert({
        section_id: sectionId,
        faculty_id: facultyId,
        room_id: roomId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        class_type: classType,
        is_active: isActive
      });

    if (insertError) {
      console.error("Timetable creation error:", insertError);
      return { error: "Failed to create schedule." };
    }

    revalidatePath("/admin/timetable");
    return { success: true };
  } catch (error) {
    console.error("createTimetableAction error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function updateTimetableAction(id, formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const sectionId = formData.get("section_id");
    const facultyId = formData.get("faculty_id");
    const roomId = formData.get("room_id");
    const dayOfWeek = parseInt(formData.get("day_of_week"), 10);
    const startTime = formData.get("start_time");
    const endTime = formData.get("end_time");
    const classType = formData.get("class_type") || "Lecture";
    const isActive = formData.get("is_active") === "true";

    if (startTime >= endTime) {
      return { error: "Start time must be before end time." };
    }

    // Check auth
    const { data: existing, error: existError } = await supabase
      .from('timetable_entries')
      .select('sections!inner(subjects!inner(courses!inner(programs!inner(departments!inner(organization_id)))))')
      .eq('id', id)
      .single();

    if (existError || existing?.sections?.subjects?.courses?.programs?.departments?.organization_id !== profile.organization_id) {
      return { error: "Unauthorized or schedule not found." };
    }

    // Check conflicts excluding current id
    const conflictMsg = await checkTimetableConflicts(supabase, {
      dayOfWeek, startTime, endTime, facultyId, sectionId, roomId, excludeId: id
    });

    if (conflictMsg) {
      return { error: conflictMsg };
    }

    const courseId = formData.get("course_id");

    if (courseId) {
      const { data: existingAssignment } = await supabase
        .from('faculty_assignments')
        .select('id')
        .eq('faculty_id', facultyId)
        .eq('subject_id', courseId)
        .maybeSingle();
        
      if (!existingAssignment) {
        await supabase
          .from('faculty_assignments')
          .insert({
            faculty_id: facultyId,
            subject_id: courseId,
            is_primary: false
          });
      }
    }

    const { error: updateError } = await supabase
      .from('timetable_entries')
      .update({
        section_id: sectionId,
        faculty_id: facultyId,
        room_id: roomId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        class_type: classType,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      return { error: "Failed to update schedule." };
    }

    revalidatePath("/admin/timetable");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteTimetableAction(id) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const { data: existing, error: existError } = await supabase
      .from('timetable_entries')
      .select('sections!inner(subjects!inner(courses!inner(programs!inner(departments!inner(organization_id)))))')
      .eq('id', id)
      .single();

    if (existError || existing?.sections?.subjects?.courses?.programs?.departments?.organization_id !== profile.organization_id) {
      return { error: "Unauthorized or schedule not found." };
    }

    const { error } = await supabase
      .from('timetable_entries')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: "Failed to delete schedule." };
    }

    revalidatePath("/admin/timetable");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}
