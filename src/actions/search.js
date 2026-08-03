"use server";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function searchStudentData(query) {
  if (!query || query.length < 2) return [];

  const profile = await requireRole(["student"]);
  const supabase = await createClient();
  const searchLower = query.toLowerCase();

  const results = [];

  // 1. Search Courses
  try {
    const { data: enrollments } = await supabase
      .from("student_enrollments")
      .select(`
        section_id,
        sections (
          id,
          name,
          subjects (
            id, code, title,
            courses (id, code, title)
          )
        )
      `)
      .eq("student_id", profile.id)
      .eq("status", "active");

    if (enrollments) {
      enrollments.forEach(e => {
        const course = e.sections?.subjects?.courses;
        if (course) {
          if (course.title.toLowerCase().includes(searchLower) || course.code.toLowerCase().includes(searchLower)) {
            results.push({
              id: `course-${e.section_id}`,
              type: "Course",
              title: course.title,
              subtitle: `${course.code} - ${e.sections.name}`,
              href: `/student/courses/${e.section_id}`,
              icon: "BookOpen"
            });
          }
        }
      });
    }
  } catch (err) {
    console.error("Search error (Courses):", err);
  }

  // 2. Search Assignments
  try {
    const { data: enrollments } = await supabase
      .from("student_enrollments")
      .select("section_id")
      .eq("student_id", profile.id)
      .eq("status", "active");

    const sectionIds = enrollments?.map(e => e.section_id) || [];
    
    if (sectionIds.length > 0) {
      const { data: assignments } = await supabase
        .from("assignments")
        .select(`
          id, title,
          sections (
            subjects (courses (title))
          )
        `)
        .in("section_id", sectionIds)
        .eq("is_published", true)
        .ilike("title", `%${query}%`)
        .limit(5);

      if (assignments) {
        assignments.forEach(a => {
          results.push({
            id: `assignment-${a.id}`,
            type: "Assignment",
            title: a.title,
            subtitle: a.sections?.subjects?.courses?.title || "Assignment",
            href: `/student/assignments/${a.id}`,
            icon: "FileText"
          });
        });
      }
    }
  } catch (err) {
    console.error("Search error (Assignments):", err);
  }

  // 3. Search Announcements
  try {
    const { data: announcements } = await supabase
      .from("announcements")
      .select("id, title, message")
      .eq("organization_id", profile.organization_id)
      .or(`title.ilike.%${query}%,message.ilike.%${query}%`)
      .limit(5);

    if (announcements) {
      announcements.forEach(a => {
        results.push({
          id: `announcement-${a.id}`,
          type: "Announcement",
          title: a.title,
          subtitle: a.message.substring(0, 50) + "...",
          href: "/student/announcements",
          icon: "Bell"
        });
      });
    }
  } catch (err) {
    console.error("Search error (Announcements):", err);
  }

  // 4. Search Library
  try {
    const { data: loans } = await supabase
      .from("library_loans")
      .select(`
        id,
        book_copies (
          books (title, author)
        )
      `)
      .eq("borrower_id", profile.id);

    if (loans) {
      loans.forEach(loan => {
        const book = loan.book_copies?.books;
        if (book && (book.title.toLowerCase().includes(searchLower) || book.author.toLowerCase().includes(searchLower))) {
          results.push({
            id: `library-${loan.id}`,
            type: "Library",
            title: book.title,
            subtitle: `Author: ${book.author}`,
            href: "/student/library",
            icon: "Library"
          });
        }
      });
    }
  } catch (err) {
    console.error("Search error (Library):", err);
  }

  return results;
}

export async function searchFacultyData(query) {
  if (!query || query.length < 2) return [];

  const profile = await requireRole(["faculty"]);
  const supabase = await createClient();
  const searchLower = query.toLowerCase();

  const results = [];

  try {
    const { data: assignments } = await supabase
      .from("faculty_assignments")
      .select(`
        section_id,
        sections (
          id,
          name,
          subjects (
            id, code, title,
            courses (id, code, title)
          )
        )
      `)
      .eq("faculty_id", profile.id);

    if (assignments) {
      const sectionIds = assignments.map(a => a.section_id);

      // Search Assigned Courses/Sections
      assignments.forEach(a => {
        const course = a.sections?.subjects?.courses;
        if (course) {
          if (course.title.toLowerCase().includes(searchLower) || 
              course.code.toLowerCase().includes(searchLower) ||
              a.sections.name.toLowerCase().includes(searchLower)) {
            results.push({
              id: `course-${a.section_id}`,
              type: "Course",
              title: course.title,
              subtitle: `${course.code} - ${a.sections.name}`,
              href: `/faculty/courses/${a.section_id}`,
              icon: "BookOpen"
            });
          }
        }
      });

      // Search Assignments in Assigned Sections
      if (sectionIds.length > 0) {
        const { data: classAssignments } = await supabase
          .from("assignments")
          .select(`
            id, title,
            sections (
              name,
              subjects (courses (title))
            )
          `)
          .in("section_id", sectionIds)
          .ilike("title", `%${query}%`)
          .limit(5);

        if (classAssignments) {
          classAssignments.forEach(ca => {
            results.push({
              id: `assignment-${ca.id}`,
              type: "Assignment",
              title: ca.title,
              subtitle: `${ca.sections?.subjects?.courses?.title || "Course"} - ${ca.sections?.name}`,
              href: `/faculty/assignments/${ca.id}`,
              icon: "FileText"
            });
          });
        }
      }
    }
  } catch (err) {
    console.error("Search error (Faculty):", err);
  }

  // 3. Search Students (in assigned sections)
  // This might be tricky if we don't fetch all enrollments. Let's do a basic query.
  // We can do this if it's explicitly needed, but the prompt says: "students in assigned sections".
  try {
    const { data: facultyAssignments } = await supabase
      .from("faculty_assignments")
      .select("section_id")
      .eq("faculty_id", profile.id);

    const sectionIds = facultyAssignments?.map(a => a.section_id) || [];
    
    if (sectionIds.length > 0) {
      const { data: students } = await supabase
        .from("student_enrollments")
        .select(`
          profiles!inner (id, first_name, last_name, email),
          sections (name, subjects(courses(title)))
        `)
        .in("section_id", sectionIds)
        .eq("status", "active")
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`, { foreignTable: "profiles" })
        .limit(5);

      if (students) {
        // Deduplicate students across sections
        const seenStudents = new Set();
        students.forEach(s => {
          if (!seenStudents.has(s.profiles.id)) {
            seenStudents.add(s.profiles.id);
            results.push({
              id: `student-${s.profiles.id}`,
              type: "Student",
              title: `${s.profiles.first_name} ${s.profiles.last_name}`,
              subtitle: s.profiles.email,
              href: `/faculty/courses/${s.sections?.id || ''}`, // Link to course since no student profile page exists yet
              icon: "User"
            });
          }
        });
      }
    }
  } catch (err) {
    console.error("Search error (Faculty Students):", err);
  }

  return results;
}
