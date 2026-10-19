export type RsvpStatus = 'attending' | 'declined'
export type ResponseState = RsvpStatus | 'pending'

export type Invitation = {
  id: string
  code: string
  access_token: string
  party_name: string
  guest_names: string[]
  email: string | null
  max_guests: number
  notes: string | null
  created_at: string
  updated_at: string
}

export type Rsvp = {
  id: string
  invitation_id: string
  status: RsvpStatus
  respondent_name: string
  attendee_count: number
  attendee_names: string[]
  dietary_requirements: string | null
  message: string | null
  revision: number
  updated_by: 'guest' | 'admin'
  submitted_at: string
  updated_at: string
}

export type InvitationWithRsvp = Invitation & { rsvp: Rsvp | null }

/** The only invitation data ever sent to a guest's browser. */
export type GuestInvitationView = {
  partyName: string
  guestNames: string[]
  maxGuests: number
  existing: {
    status: RsvpStatus
    respondentName: string
    attendeeCount: number
    attendeeNames: string[]
    dietaryRequirements: string | null
    message: string | null
    updatedAt: string
  } | null
}

/** Proof of authorization a guest presents with every RSVP request. */
export type GuestCredential = { type: 'code'; value: string } | { type: 'token'; value: string }

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
