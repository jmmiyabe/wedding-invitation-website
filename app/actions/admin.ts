'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAdminContext } from '@/lib/auth'
import { firstFieldErrors, invitationInputSchema, rsvpInputSchema, type RsvpInput } from '@/lib/validation'
import type { ActionResult } from '@/lib/types'

const idSchema = z.uuid()

async function adminOrError() {
  const ctx = await getAdminContext()
  return ctx.status === 'admin' ? ctx : null
}

const FORBIDDEN = { ok: false as const, error: 'You are not authorized to perform this action.' }

export async function saveInvitation(
  id: string | null,
  input: { partyName: string; guestNames: string; email: string; maxGuests: number; notes: string },
): Promise<ActionResult> {
  const ctx = await adminOrError()
  if (!ctx) return FORBIDDEN
  if (id !== null && !idSchema.safeParse(id).success) return { ok: false, error: 'Invalid invitation.' }

  const parsed = invitationInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors: firstFieldErrors(parsed.error) }
  }
  const row = {
    party_name: parsed.data.partyName,
    guest_names: parsed.data.guestNames,
    email: parsed.data.email,
    max_guests: parsed.data.maxGuests,
    notes: parsed.data.notes,
  }

  if (id) {
    const { data: existing } = await ctx.supabase
      .from('rsvps')
      .select('attendee_count')
      .eq('invitation_id', id)
      .maybeSingle()
    if (existing && existing.attendee_count > row.max_guests) {
      return {
        ok: false,
        error: `This party already RSVP’d for ${existing.attendee_count}. Update their RSVP first.`,
        fieldErrors: { maxGuests: 'Lower than the current RSVP count.' },
      }
    }
  }

  const { error } = id
    ? await ctx.supabase.from('invitations').update(row).eq('id', id)
    : await ctx.supabase.from('invitations').insert(row)
  if (error) {
    console.error('Save invitation failed', error.message)
    return { ok: false, error: 'Could not save the invitation. Please try again.' }
  }
  revalidatePath('/admin')
  return { ok: true, data: undefined }
}

export async function deleteInvitation(id: string): Promise<ActionResult> {
  const ctx = await adminOrError()
  if (!ctx) return FORBIDDEN
  if (!idSchema.safeParse(id).success) return { ok: false, error: 'Invalid invitation.' }
  const { error } = await ctx.supabase.from('invitations').delete().eq('id', id)
  if (error) return { ok: false, error: 'Could not delete the invitation.' }
  revalidatePath('/admin')
  return { ok: true, data: undefined }
}

export async function regenerateAccess(id: string): Promise<ActionResult> {
  const ctx = await adminOrError()
  if (!ctx) return FORBIDDEN
  if (!idSchema.safeParse(id).success) return { ok: false, error: 'Invalid invitation.' }
  const { data: code, error: codeError } = await ctx.supabase.rpc('generate_invite_code')
  if (codeError || typeof code !== 'string') return { ok: false, error: 'Could not generate a new code.' }
  const token = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('')
  const { error } = await ctx.supabase
    .from('invitations')
    .update({ code, access_token: token })
    .eq('id', id)
  if (error) return { ok: false, error: 'Could not regenerate access.' }
  revalidatePath('/admin')
  return { ok: true, data: undefined }
}

export async function saveRsvpAsAdmin(invitationId: string, input: RsvpInput): Promise<ActionResult> {
  const ctx = await adminOrError()
  if (!ctx) return FORBIDDEN
  if (!idSchema.safeParse(invitationId).success) return { ok: false, error: 'Invalid invitation.' }

  const parsed = rsvpInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors: firstFieldErrors(parsed.error) }
  }
  const { data: invitation } = await ctx.supabase
    .from('invitations')
    .select('max_guests')
    .eq('id', invitationId)
    .maybeSingle()
  if (!invitation) return { ok: false, error: 'Invitation not found.' }
  if (parsed.data.attendeeCount > invitation.max_guests) {
    return {
      ok: false,
      error: `This invitation allows up to ${invitation.max_guests}.`,
      fieldErrors: { attendeeCount: 'Too many guests.' },
    }
  }

  const { error } = await ctx.supabase.from('rsvps').upsert(
    {
      invitation_id: invitationId,
      status: parsed.data.status,
      respondent_name: parsed.data.respondentName,
      attendee_count: parsed.data.attendeeCount,
      attendee_names: parsed.data.attendeeNames,
      dietary_requirements: parsed.data.dietaryRequirements,
      message: parsed.data.message,
      updated_by: 'admin',
    },
    { onConflict: 'invitation_id' },
  )
  if (error) {
    console.error('Admin RSVP save failed', error.message)
    return { ok: false, error: 'Could not save the RSVP.' }
  }
  revalidatePath('/admin')
  return { ok: true, data: undefined }
}

export async function clearRsvp(invitationId: string): Promise<ActionResult> {
  const ctx = await adminOrError()
  if (!ctx) return FORBIDDEN
  if (!idSchema.safeParse(invitationId).success) return { ok: false, error: 'Invalid invitation.' }
  const { error } = await ctx.supabase.from('rsvps').delete().eq('invitation_id', invitationId)
  if (error) return { ok: false, error: 'Could not reset the RSVP.' }
  revalidatePath('/admin')
  return { ok: true, data: undefined }
}
