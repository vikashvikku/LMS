'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['student', 'faculty']).default('student'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function login(formData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: 'Invalid input data.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', (await supabase.auth.getUser()).data.user.id).single()
  const role = profile?.role || 'student'
  const { getDashboardPathForRole } = await import('@/lib/auth')

  revalidatePath('/', 'layout')
  redirect(getDashboardPathForRole(role))
}

export async function signup(formData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: 'Invalid input data or unauthorized role.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        role: parsed.data.role, // Passed securely; trigger explicitly rejects unauthorized roles
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (data?.user?.identities?.length === 0) {
    return { error: 'An account with this email already exists.' }
  }

  if (!data.session) {
    return { success: true, message: 'Check your email to confirm your account.' }
  }

  const { getDashboardPathForRole } = await import('@/lib/auth')
  revalidatePath('/', 'layout')
  redirect(getDashboardPathForRole(parsed.data.role))
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
