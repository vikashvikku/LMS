import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) return null;
  
  return profile;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect('/login');
  }
  return profile;
}

export async function requireRole(allowedRoles) {
  const profile = await requireProfile();

  if (!allowedRoles.includes(profile.role)) {
    redirect(getDashboardPathForRole(profile.role));
  }
  
  return profile;
}

export function getDashboardPathForRole(role) {
  switch (role) {
    case 'student':
      return '/student/dashboard';
    case 'faculty':
      return '/faculty/dashboard';
    case 'department_head':
      return '/department-head/dashboard';
    case 'university_admin':
      return '/admin/dashboard';
    case 'super_admin':
      return '/super-admin/dashboard';
    case 'parent':
      return '/parent/dashboard';
    case 'finance':
      return '/finance/dashboard';
    case 'librarian':
      return '/library/dashboard';
    default:
      return '/login'; // Fallback
  }
}
