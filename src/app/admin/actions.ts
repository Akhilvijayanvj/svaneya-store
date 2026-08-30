"use server";
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id);
  if (!error) revalidatePath('/admin');
}
