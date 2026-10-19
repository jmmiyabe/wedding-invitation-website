'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { wedding } from '@/lib/wedding-config'
import type { GuestInvitationView } from '@/lib/types'
import { FloralSprig, GoldRule } from './ornaments'

export function RsvpConfirmation({
  view,
  isUpdate,
  onEdit,
}: {
  view: GuestInvitationView
  isUpdate: boolean
  onEdit: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => headingRef.current?.focus(), [])

  const r = view.existing
  const attending = r?.status === 'attending'

  return (
    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-700">
      <FloralSprig className="max-w-[14rem]" />
      <p className="eyebrow mt-4 text-gold">{isUpdate ? 'Response updated' : 'Response received'}</p>
      <h3 ref={headingRef} tabIndex={-1} className="mt-4 font-serif text-4xl font-light outline-none md:text-5xl">
        {attending ? 'We can’t wait to celebrate with you.' : 'You will be dearly missed.'}
      </h3>
      <p className="mt-5 max-w-md leading-relaxed text-muted-foreground text-pretty">
        {attending
          ? `Thank you, ${r?.respondentName}. We have saved ${r?.attendeeCount === 1 ? 'one seat' : `${r?.attendeeCount} seats`} for ${view.partyName} on ${wedding.dateLabel}.`
          : `Thank you for letting us know, ${r?.respondentName}. We’ll be thinking of you on the day.`}
      </p>

      {attending && r && (
        <dl className="mt-8 grid w-full max-w-md gap-4 rounded-sm border border-border bg-card p-6 text-left text-sm">
          {r.attendeeNames.length > 0 && (
            <div>
              <dt className="eyebrow text-sage-deep">Guests</dt>
              <dd className="mt-1">{r.attendeeNames.join(', ')}</dd>
            </div>
          )}
          {r.dietaryRequirements && (
            <div>
              <dt className="eyebrow text-sage-deep">Dietary notes</dt>
              <dd className="mt-1">{r.dietaryRequirements}</dd>
            </div>
          )}
        </dl>
      )}

      <GoldRule className="my-8" />
      <p className="max-w-sm text-sm text-muted-foreground text-pretty">
        Plans change — you can update your response with the same code or link until{' '}
        {wedding.rsvpDeadlineLabel}.
      </p>
      <Button variant="outline" onClick={onEdit} className="eyebrow mt-6 h-11 rounded-full px-8">
        Edit my response
      </Button>
    </div>
  )
}
