import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const email = 'vikkuvikash79097@gmail.com';
  console.log(`Checking for student: ${email}`);

  // 1. Get auth user
  const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr) {
    console.error("Auth error:", userErr);
    return;
  }
  const user = users.users.find(u => u.email === email);
  if (!user) {
    console.error(`User ${email} not found in auth.users`);
    return;
  }
  console.log("Auth User ID:", user.id);

  // 2. Profile
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profErr) {
    console.error("Profile error:", profErr);
    return;
  }
  console.log("Profile:", profile);

  // 3. Student Enrollments Raw
  const { data: enrollmentsRaw, error: err1 } = await supabase
    .from('student_enrollments')
    .select('*')
    .eq('student_id', profile.id);
  
  if (err1) console.error("Enrollments raw error:", err1);
  console.log("Enrollments raw count:", enrollmentsRaw?.length);

  // 4. Student Courses Query
  const { data, error } = await supabase
    .from('student_enrollments')
    .select(`
      id,
      status,
      sections (
        id,
        name,
        subjects (
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
    console.error("Student Courses Query Error:", error);
  } else {
    console.log("Student Courses Query Result count:", data?.length);
    console.log("Student Courses Query Result [0]:", JSON.stringify(data?.[0], null, 2));
  }
}

run().catch(console.error);
