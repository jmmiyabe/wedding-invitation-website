'use client'

import { useState, type FormEvent } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { wedding } from '@/lib/wedding-config'
import type { GuestInvitationView, RsvpStatus } from '@/lib/types'

type Values = {
  respondentName: string
  status: RsvpStatus
  attendeeCount: number
  attendeeNames: string[]
  dietaryRequirements: string
  message: string
}

export function RsvpForm({
  view,
  rsvpOpen,
  pending,
  error,
  fieldErrors,
  onSubmit,
  onBack,
}: {
  view: GuestInvitationView
  rsvpOpen: boolean
  pending: boolean
  error: string | null
  fieldErrors: Record<string, string>
  onSubmit: (e: FormEvent, values: Values) => void
  onBack?: () => void
}) {
  const ex = view.existing
  const [respondentName, setRespondentName] = useState(ex?.respondentName ?? view.guestNames[0] ?? '')
  const [status, setStatus] = useState<RsvpStatus | null>(ex?.status ?? null)
  const [attendeeCount, setAttendeeCount] = useState(
    ex && ex.attendeeCount > 0 ? ex.attendeeCount : view.maxGuests,
  )
  const [attendeeNames, setAttendeeNames] = useState<string[]>(() =>
    Array.from({ length: view.maxGuests }, (_, i) => ex?.attendeeNames[i] ?? view.guestNames[i] ?? ''),
  )
  const [dietaryRequirements, setDietary] = useState(ex?.dietaryRequirements ?? '')
  const [message, setMessage] = useState(ex?.message ?? '')

  const disabled = pending || !rsvpOpen

  return (
    <form
      onSubmit={(e) => {
        if (!status) {
          e.preventDefault()
          return
        }
        onSubmit(e, { respondentName, status, attendeeCount, attendeeNames, dietaryRequirements, message })
      }}
      className="flex flex-col gap-10"
      noValidate
    >
      <div className="text-center">
        <p className="eyebrow text-muted-foreground">An invitation for</p>
        <p className="mt-3 font-serif text-3xl md:text-4xl">{view.partyName}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {view.maxGuests === 1
            ? 'We have reserved one seat in your honour.'
            : `We have reserved ${view.maxGuests} seats in your honour.`}
        </p>
        {ex && (
          <p className="mx-auto mt-5 max-w-md rounded-sm bg-secondary px-4 py-3 text-sm text-secondary-foreground">
            You replied that you will{' '}
            <strong className="font-medium">{ex.status === 'attending' ? 'attend' : 'not be able to attend'}</strong>.
            {rsvpOpen ? ' You can update your response below.' : ''}
          </p>
        )}
        {!rsvpOpen && (
          <p role="status" className="mx-auto mt-5 max-w-md text-sm text-destructive">
            Our RSVP deadline has passed. To make a change, please email {wedding.contactEmail}.
          </p>
        )}
      </div>

      <fieldset disabled={disabled} className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <Label htmlFor="respondent-name" className="eyebrow text-sage-deep">
            Your full name
          </Label>
          <Input
            id="respondent-name"
            value={respondentName}
            onChange={(e) => setRespondentName(e.target.value)}
            autoComplete="name"
            maxLength={120}
            required
            aria-invalid={!!fieldErrors.respondentName}
            className="h-11 bg-card"
          />
          <FieldError message={fieldErrors.respondentName} />
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="eyebrow mb-3 text-sage-deep">Will you join us?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                { value: 'attending', title: 'Joyfully accepts', note: 'We’ll be there' },
                { value: 'declined', title: 'Regretfully declines', note: 'Celebrating from afar' },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-1 rounded-sm border bg-card px-4 py-6 text-center transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                  status === opt.value ? 'border-sage-deep bg-secondary' : 'border-border hover:border-gold/60',
                )}
              >
                <input
                  type="radio"
                  name="status"
                  value={opt.value}
                  checked={status === opt.value}
                  onChange={() => setStatus(opt.value)}
                  className="sr-only"
                  required
                />
                <span className="font-serif text-2xl italic">{opt.title}</span>
                <span className="text-sm text-muted-foreground">{opt.note}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {status === 'attending' && (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-top-2 duration-500">
            {view.maxGuests > 1 && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="attendee-count" className="eyebrow text-sage-deep">
                  Number attending
                </Label>
                <select
                  id="attendee-count"
                  value={attendeeCount}
                  onChange={(e) => setAttendeeCount(Number(e.target.value))}
                  aria-invalid={!!fieldErrors.attendeeCount}
                  className="h-11 rounded-md border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {Array.from({ length: view.maxGuests }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'guest' : 'guests'}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldErrors.attendeeCount} />
              </div>
            )}

            <fieldset className="flex flex-col gap-3">
              <legend className="eyebrow mb-3 text-sage-deep">
                {attendeeCount === 1 ? 'Guest name' : 'Guest names'}
              </legend>
              {Array.from({ length: attendeeCount }, (_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <Label htmlFor={`attendee-${i}`} className="sr-only">
                    Guest {i + 1} name
                  </Label>
                  <Input
                    id={`attendee-${i}`}
                    value={attendeeNames[i] ?? ''}
                    placeholder={`Guest ${i + 1}`}
                    maxLength={120}
                    onChange={(e) =>
                      setAttendeeNames((prev) => prev.map((n, j) => (j === i ? e.target.value : n)))
                    }
                    className="h-11 bg-card"
                  />
                </div>
              ))}
            </fieldset>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dietary" className="eyebrow text-sage-deep">
                Dietary requirements <span className="normal-case tracking-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="dietary"
                value={dietaryRequirements}
                onChange={(e) => setDietary(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="Allergies, vegetarian, vegan, gluten-free…"
                className="bg-card"
              />
              <FieldError message={fieldErrors.dietaryRequirements} />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="message" className="eyebrow text-sage-deep">
            A note for the couple <span className="normal-case tracking-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={3}
            className="bg-card"
          />
          <FieldError message={fieldErrors.message} />
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
        {onBack ? (
          <Button type="button" variant="ghost" onClick={onBack} className="eyebrow text-muted-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Different code
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="submit"
          disabled={disabled || !status || !respondentName.trim()}
          className="eyebrow h-12 w-full rounded-full px-10 sm:w-auto"
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {ex ? 'Update my response' : 'Send my response'}
        </Button>
      </div>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  )
}
