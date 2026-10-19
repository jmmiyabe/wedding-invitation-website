import { z } from 'zod'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Please keep this under ${max} characters.`)
    .optional()
    .transform((v) => (v ? v : null))

export const inviteCodeSchema = z
  .string()
  .transform((v) => v.toUpperCase().replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^[A-Z0-9]{6,12}$/, 'Please enter the code printed on your invitation.'))

export const accessTokenSchema = z.string().regex(/^[a-f0-9]{48}$/, 'Invalid invitation link.')

export const credentialSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('code'), value: inviteCodeSchema }),
  z.object({ type: z.literal('token'), value: accessTokenSchema }),
])

const personName = z.string().trim().min(1, 'Please enter a name.').max(120, 'That name is too long.')

export const rsvpInputSchema = z
  .object({
    respondentName: personName,
    status: z.enum(['attending', 'declined']),
    attendeeCount: z.number().int().min(0).max(12),
    attendeeNames: z.array(z.string().trim().max(120)).max(12),
    dietaryRequirements: optionalText(500),
    message: optionalText(1000),
  })
  .transform((v) => {
    if (v.status === 'declined') {
      return { ...v, attendeeCount: 0, attendeeNames: [], dietaryRequirements: null }
    }
    return { ...v, attendeeNames: v.attendeeNames.slice(0, v.attendeeCount).filter(Boolean) }
  })
  .refine((v) => v.status === 'declined' || v.attendeeCount >= 1, {
    message: 'Please tell us how many guests will attend.',
    path: ['attendeeCount'],
  })

export type RsvpInput = z.input<typeof rsvpInputSchema>

export const invitationInputSchema = z.object({
  partyName: z.string().trim().min(1, 'Party name is required.').max(120),
  guestNames: z
    .string()
    .max(2000)
    .transform((v) =>
      v
        .split(/\n|,/)
        .map((n) => n.trim())
        .filter(Boolean)
        .slice(0, 12),
    ),
  email: z
    .string()
    .trim()
    .max(254)
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.email('Please enter a valid email.').nullable()),
  maxGuests: z.coerce.number().int().min(1, 'At least 1 guest.').max(12, 'At most 12 guests.'),
  notes: optionalText(1000),
})

export function firstFieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form'
    out[key] ??= issue.message
  }
  return out
}
