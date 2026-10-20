'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export type AuthFormState = { error?: string; notice?: string } | undefined

const credentialsSchema = z.object({
  email: z.email('Please enter a valid email.').max(254),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
})

export async function signInAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    password: String(formData.get('password') ?? ''),
  })
  if (!parsed.success) return { error: 'Invalid email or password.' }

  if (!(await rateLimit('admin-login', 10, 900))) {
    return { error: 'Too many sign-in attempts. Please wait a few minutes.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    console.error('Admin sign-in failed:', error.code, error.message)
    if (error.code === 'email_not_confirmed') {
      return { error: 'Please confirm your email address first — check your inbox for the link.' }
    }
    if (error.status === 429) return { error: 'Too many attempts. Please try again shortly.' }
    if (error.code === 'invalid_credentials') return { error: 'Invalid email or password.' }
    return { error: 'Sign-in failed unexpectedly. Please try again.' }
  }
  redirect('/admin')
}

export async function signUpAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    password: String(formData.get('password') ?? ''),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }

  if (!(await rateLimit('admin-signup', 5, 3600))) {
    return { error: 'Too many attempts. Please try again later.' }
  }

  const origin = String(formData.get('origin') ?? '')
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${origin}/auth/callback?next=/admin`,
    },
  })
  if (error) {
    console.error('Admin sign-up failed:', error.code, error.message)
    if (error.code === 'weak_password') return { error: 'Please choose a stronger password.' }
    if (error.status === 429) return { error: 'Too many attempts. Please try again later.' }
    if (error.code === 'email_address_invalid') return { error: 'Please use a real email address.' }
    if (error.code !== 'user_already_exists') {
      return { error: 'Sign-up failed unexpectedly. Please try again.' }
    }
  }
  return {
    notice:
      'If this address can register, a confirmation email is on its way. Admin access is granted only to allow-listed emails.',
  }
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
