import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminAuthForm } from '@/components/admin/admin-auth-form'
import { getAdminContext } from '@/lib/auth'

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false } }

export default async function AdminLoginPage() {
  const ctx = await getAdminContext()
  if (ctx.status === 'admin') redirect('/admin')
  return <AdminAuthForm mode="sign-in" />
}
