import 'server-only'
import type { createClient } from '@/lib/supabase/server'
import type { InvitationWithRsvp, ResponseState } from '@/lib/types'

type Client = Awaited<ReturnType<typeof createClient>>

export async function fetchInvitations(supabase: Client): Promise<InvitationWithRsvp[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, rsvp:rsvps(*)')
    .order('party_name', { ascending: true })
  if (error) throw new Error(`Failed to load invitations: ${error.message}`)
  return (data ?? []).map((row) => ({
    ...row,
    rsvp: Array.isArray(row.rsvp) ? (row.rsvp[0] ?? null) : (row.rsvp ?? null),
  })) as InvitationWithRsvp[]
}

export function responseState(inv: InvitationWithRsvp): ResponseState {
  return inv.rsvp?.status ?? 'pending'
}

export function summarize(invitations: InvitationWithRsvp[]) {
  let invitedGuests = 0
  let attendingGuests = 0
  let declinedParties = 0
  let pendingParties = 0
  let pendingSeats = 0
  let attendingParties = 0
  for (const inv of invitations) {
    invitedGuests += inv.max_guests
    const state = responseState(inv)
    if (state === 'attending') {
      attendingParties++
      attendingGuests += inv.rsvp!.attendee_count
    } else if (state === 'declined') declinedParties++
    else {
      pendingParties++
      pendingSeats += inv.max_guests
    }
  }
  return {
    parties: invitations.length,
    invitedGuests,
    attendingGuests,
    attendingParties,
    declinedParties,
    pendingParties,
    pendingSeats,
  }
}
