"use server";

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function markAllNotificationsAsRead() {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', profile.id)
    .eq('is_read', false);

  if (error) {
    console.error("Failed to mark notifications as read:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/student/notifications');
  revalidatePath('/student/dashboard');
  return { success: true };
}
