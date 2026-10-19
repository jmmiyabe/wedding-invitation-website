import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AdminContext =
  | { status: 'admin'; email: string; supabase: Awaited<ReturnType<typeof createClient>> }
  | { status: 'unauthenticated' }
  | { status: 'forbidden'; email: string }

/** Verifies the session with Supabase Auth and checks the admin allow-list in the database. */
export async function getAdminContext(): Promise<AdminContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { status: 'unauthenticated' }

  const { data: isAdmin, error } = await supabase.rpc('is_admin')
  if (error || isAdmin !== true) return { status: 'forbidden', email: user.email ?? '' }

  return { status: 'admin', email: user.email ?? '', supabase }
}

/** For server actions and pages: redirects or throws unless the caller is an admin. */
export async function requireAdmin() {
  const ctx = await getAdminContext()
  if (ctx.status === 'unauthenticated') redirect('/admin/login')
  if (ctx.status === 'forbidden') redirect('/admin/unauthorized')
  return ctx
}
