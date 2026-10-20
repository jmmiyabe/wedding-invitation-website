'use server'

import { getServiceClient } from '@/lib/supabase/service'
import { rateLimit } from '@/lib/rate-limit'
import { credentialSchema, firstFieldErrors, rsvpInputSchema, type RsvpInput } from '@/lib/validation'
import { isRsvpOpen, wedding } from '@/lib/wedding-config'
import type { ActionResult, GuestCredential, GuestInvitationView, RsvpStatus } from '@/lib/types'

const NOT_FOUND =
  'We couldn’t find an invitation matching that code. Please check it and try again.'

type InvitationRow = {
  id: string
  party_name: string
  guest_names: string[]
  max_guests: number
  rsvps: {
    status: RsvpStatus
    respondent_name: string
    attendee_count: number
    attendee_names: string[]
    dietary_requirements: string | null
    message: string | null
    updated_at: string
  } | null
}

async function findInvitation(credential: unknown) {
  const parsed = credentialSchema.safeParse(credential)
  if (!parsed.success) return null

  const column = parsed.data.type === 'code' ? 'code' : 'access_token'
  const { data, error } = await getServiceClient()
    .from('invitations')
    .select(
      'id, party_name, guest_names, max_guests, rsvps(status, respondent_name, attendee_count, attendee_names, dietary_requirements, message, updated_at)',
    )
    .eq(column, parsed.data.value)
    .maybeSingle()

  if (error) {
    console.error('Invitation lookup failed', error.message)
    throw new Error('lookup_failed')
  }
  return data as InvitationRow | null
}

function toGuestView(row: InvitationRow): GuestInvitationView {
  const r = row.rsvps
  return {
    partyName: row.party_name,
    guestNames: row.guest_names,
    maxGuests: row.max_guests,
    existing: r
      ? {
          status: r.status,
          respondentName: r.respondent_name,
          attendeeCount: r.attendee_count,
          attendeeNames: r.attendee_names,
          dietaryRequirements: r.dietary_requirements,
          message: r.message,
          updatedAt: r.updated_at,
        }
      : null,
  }
}

export async function lookupInvitation(
  credential: GuestCredential,
): Promise<ActionResult<GuestInvitationView>> {
  try {
    if (!(await rateLimit('rsvp-lookup', 15, 600))) {
      return { ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' }
    }
    const row = await findInvitation(credential)
    if (!row) return { ok: false, error: NOT_FOUND }
    return { ok: true, data: toGuestView(row) }
  } catch {
    return { ok: false, error: 'Something went wrong on our side. Please try again shortly.' }
  }
}

export type SubmitResult = {
  status: RsvpStatus
  attendeeCount: number
  isUpdate: boolean
  view: GuestInvitationView
}

export async function submitRsvp(
  credential: GuestCredential,
  input: RsvpInput,
): Promise<ActionResult<SubmitResult>> {
  try {
    if (!isRsvpOpen()) {
      return {
        ok: false,
        error: `Our RSVP deadline has passed. Please email ${wedding.contactEmail} and we’ll do our best to help.`,
      }
    }
    if (!(await rateLimit('rsvp-submit', 20, 3600))) {
      return { ok: false, error: 'Too many submissions. Please wait a little while and try again.' }
    }

    const parsedInput = rsvpInputSchema.safeParse(input)
    if (!parsedInput.success) {
      return {
        ok: false,
        error: 'Please review the highlighted fields.',
        fieldErrors: firstFieldErrors(parsedInput.error),
      }
    }

    // Re-verify the credential on every write; the browser is never trusted.
    const row = await findInvitation(credential)
    if (!row) return { ok: false, error: NOT_FOUND }

    const v = parsedInput.data
    if (v.attendeeCount > row.max_guests) {
      return {
        ok: false,
        error: `Your invitation includes ${row.max_guests} ${row.max_guests === 1 ? 'seat' : 'seats'}.`,
        fieldErrors: { attendeeCount: `Please choose up to ${row.max_guests}.` },
      }
    }

    const { error } = await getServiceClient()
      .from('rsvps')
      .upsert(
        {
          invitation_id: row.id,
          status: v.status,
          respondent_name: v.respondentName,
          attendee_count: v.attendeeCount,
          attendee_names: v.attendeeNames,
          dietary_requirements: v.dietaryRequirements,
          message: v.message,
          updated_by: 'guest',
        } as never,
        { onConflict: 'invitation_id' },
      )

    if (error) {
      console.error('RSVP upsert failed', error.message)
      return { ok: false, error: 'We couldn’t save your response. Please try again.' }
    }

    const updated = await findInvitation(credential)
    return {
      ok: true,
      data: {
        status: v.status,
        attendeeCount: v.attendeeCount,
        isUpdate: row.rsvps !== null,
        view: toGuestView(updated ?? row),
      },
    }
  } catch {
    return { ok: false, error: 'Something went wrong on our side. Please try again shortly.' }
  }
}
