'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { lookupInvitation, submitRsvp } from '@/app/actions/rsvp'
import type { GuestCredential, GuestInvitationView, RsvpStatus } from '@/lib/types'
import { RsvpCodeStep } from './rsvp-code-step'
import { RsvpForm } from './rsvp-form'
import { RsvpConfirmation } from './rsvp-confirmation'

type Step =
  | { name: 'code' }
  | { name: 'form'; credential: GuestCredential; view: GuestInvitationView }
  | {
      name: 'done'
      credential: GuestCredential
      view: GuestInvitationView
      isUpdate: boolean
    }

export function RsvpFlow({
  initial,
  rsvpOpen,
}: {
  initial?: { credential: GuestCredential; view: GuestInvitationView }
  rsvpOpen: boolean
}) {
  const [step, setStep] = useState<Step>(
    initial ? { name: 'form', ...initial } : { name: 'code' },
  )
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  function handleLookup(code: string) {
    setError(null)
    startTransition(async () => {
      const credential: GuestCredential = { type: 'code', value: code }
      const res = await lookupInvitation(credential)
      if (!res.ok) return setError(res.error)
      setStep({ name: 'form', credential, view: res.data })
    })
  }

  function handleSubmit(
    e: FormEvent,
    values: {
      respondentName: string
      status: RsvpStatus
      attendeeCount: number
      attendeeNames: string[]
      dietaryRequirements: string
      message: string
    },
  ) {
    e.preventDefault()
    if (step.name !== 'form') return
    setError(null)
    setFieldErrors({})
    const { credential } = step
    startTransition(async () => {
      const res = await submitRsvp(credential, values)
      if (!res.ok) {
        setError(res.error)
        setFieldErrors(res.fieldErrors ?? {})
        return
      }
      setStep({ name: 'done', credential, view: res.data.view, isUpdate: res.data.isUpdate })
      document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div aria-live="polite">
      {step.name === 'code' && (
        <RsvpCodeStep onSubmit={handleLookup} pending={pending} error={error} />
      )}
      {step.name === 'form' && (
        <RsvpForm
          key={step.view.existing?.updatedAt ?? 'new'}
          view={step.view}
          rsvpOpen={rsvpOpen}
          pending={pending}
          error={error}
          fieldErrors={fieldErrors}
          onSubmit={handleSubmit}
          onBack={
            step.credential.type === 'code'
              ? () => {
                  setError(null)
                  setStep({ name: 'code' })
                }
              : undefined
          }
        />
      )}
      {step.name === 'done' && (
        <RsvpConfirmation
          view={step.view}
          isUpdate={step.isUpdate}
          onEdit={() => setStep({ name: 'form', credential: step.credential, view: step.view })}
        />
      )}
    </div>
  )
}
