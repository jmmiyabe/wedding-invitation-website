import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { AdminHeader } from '@/components/admin/admin-header'
import { GuestTable } from '@/components/admin/guest-table'
import { SummaryCards } from '@/components/admin/summary-cards'
import { fetchInvitations, summarize } from '@/lib/admin-data'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Guest list', robots: { index: false } }

export default async function AdminPage() {
  const ctx = await requireAdmin()
  const invitations = await fetchInvitations(ctx.supabase)
  const h = await headers()
  const origin = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`

  return (
    <div className="min-h-svh">
      <AdminHeader email={ctx.email} />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
        <div>
          <p className="eyebrow text-sage-deep">Dashboard</p>
          <h1 className="mt-2 font-serif text-4xl">Guest list &amp; responses</h1>
        </div>
        <SummaryCards summary={summarize(invitations)} />
        <GuestTable invitations={invitations} origin={origin} />
      </main>
    </div>
  )
}
