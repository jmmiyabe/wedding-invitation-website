import { NextResponse } from 'next/server'
import { getAdminContext } from '@/lib/auth'
import { fetchInvitations, responseState } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

function csvCell(value: unknown) {
  let s = value === null || value === undefined ? '' : String(value)
  // Neutralize spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET(request: Request) {
  const ctx = await getAdminContext()
  if (ctx.status !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: ctx.status === 'forbidden' ? 403 : 401 })
  }

  const invitations = await fetchInvitations(ctx.supabase)
  const origin = new URL(request.url).origin

  const header = [
    'Party',
    'Invited guests',
    'Email',
    'Seats allowed',
    'Code',
    'Personal link',
    'Status',
    'Respondent',
    'Attending count',
    'Attendee names',
    'Dietary requirements',
    'Message',
    'Updated by',
    'Last updated',
    'Admin notes',
  ]
  const rows = invitations.map((inv) => [
    inv.party_name,
    inv.guest_names.join('; '),
    inv.email,
    inv.max_guests,
    inv.code,
    `${origin}/rsvp/${inv.access_token}`,
    responseState(inv),
    inv.rsvp?.respondent_name,
    inv.rsvp?.attendee_count ?? '',
    inv.rsvp?.attendee_names.join('; '),
    inv.rsvp?.dietary_requirements,
    inv.rsvp?.message,
    inv.rsvp?.updated_by,
    inv.rsvp?.updated_at,
    inv.notes,
  ])

  const csv = '\uFEFF' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
  const date = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="guest-list-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
