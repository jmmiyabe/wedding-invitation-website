'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { clearRsvp, saveRsvpAsAdmin } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { InvitationWithRsvp, RsvpStatus } from '@/lib/types'

export function RsvpDialog({
  invitation,
  open,
  onOpenChange,
}: {
  invitation: InvitationWithRsvp | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        {open && invitation && (
          <RsvpEditor key={invitation.id} invitation={invitation} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function RsvpEditor({ invitation, onDone }: { invitation: InvitationWithRsvp; onDone: () => void }) {
  const router = useRouter()
  const r = invitation.rsvp
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<RsvpStatus>(r?.status ?? 'attending')
  const [respondentName, setRespondentName] = useState(r?.respondent_name ?? invitation.guest_names[0] ?? '')
  const [attendeeCount, setAttendeeCount] = useState(r && r.attendee_count > 0 ? r.attendee_count : invitation.max_guests)
  const [attendeeNames, setAttendeeNames] = useState(
    (r?.attendee_names.length ? r.attendee_names : invitation.guest_names).join('\n'),
  )
  const [dietary, setDietary] = useState(r?.dietary_requirements ?? '')
  const [message, setMessage] = useState(r?.message ?? '')

  function finish(res: { ok: boolean; error?: string; fieldErrors?: Record<string, string> }, msg: string) {
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {})
      toast.error(res.error)
      return
    }
    toast.success(msg)
    router.refresh()
    onDone()
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () =>
          finish(
            await saveRsvpAsAdmin(invitation.id, {
              status,
              respondentName,
              attendeeCount: status === 'attending' ? attendeeCount : 0,
              attendeeNames: attendeeNames.split('\n').map((n) => n.trim()).filter(Boolean),
              dietaryRequirements: dietary,
              message,
            }),
            'RSVP saved',
          ),
        )
      }}
      className="flex flex-col gap-5"
    >
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl font-normal">RSVP · {invitation.party_name}</DialogTitle>
        <DialogDescription>
          {r
            ? `Last updated ${new Date(r.updated_at).toLocaleString()} by ${r.updated_by} · revision ${r.revision}`
            : 'No response yet. Record one on the guest’s behalf.'}
        </DialogDescription>
      </DialogHeader>

      <div role="radiogroup" aria-label="Response" className="grid grid-cols-2 gap-2">
        {(['attending', 'declined'] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={status === s}
            onClick={() => setStatus(s)}
            className={cn(
              'rounded-md border px-3 py-2.5 text-sm capitalize transition-colors',
              status === s ? 'border-sage-deep bg-secondary text-sage-deep' : 'border-border hover:bg-muted',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-respondent">Respondent name</Label>
        <Input id="admin-respondent" value={respondentName} onChange={(e) => setRespondentName(e.target.value)} required />
        {errors.respondentName && <p className="text-sm text-destructive">{errors.respondentName}</p>}
      </div>

      {status === 'attending' && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-count">
              Attending <span className="font-normal text-muted-foreground">· max {invitation.max_guests}</span>
            </Label>
            <Input
              id="admin-count"
              type="number"
              min={1}
              max={invitation.max_guests}
              value={attendeeCount}
              onChange={(e) => setAttendeeCount(Number(e.target.value))}
            />
            {errors.attendeeCount && <p className="text-sm text-destructive">{errors.attendeeCount}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-names">
              Attendee names <span className="font-normal text-muted-foreground">· one per line</span>
            </Label>
            <Textarea id="admin-names" rows={3} value={attendeeNames} onChange={(e) => setAttendeeNames(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-dietary">Dietary requirements</Label>
            <Textarea id="admin-dietary" rows={2} value={dietary} onChange={(e) => setDietary(e.target.value)} />
          </div>
        </>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-message">Message</Label>
        <Textarea id="admin-message" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>

      <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
        {r ? (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => startTransition(async () => finish(await clearRsvp(invitation.id), 'Reset to pending'))}
          >
            Reset to pending
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={pending}>
          Save RSVP
        </Button>
      </DialogFooter>
    </form>
  )
}
