import type { Metadata } from 'next'
import { AdminAuthForm } from '@/components/admin/admin-auth-form'

export const metadata: Metadata = { title: 'Create admin account', robots: { index: false } }

export default function AdminSignUpPage() {
  return <AdminAuthForm mode="sign-up" />
}
