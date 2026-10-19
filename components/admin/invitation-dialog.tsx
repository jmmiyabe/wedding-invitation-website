'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteInvitation, regenerateAccess, saveInvitation } from '@/app/actions/admin'
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
import type { InvitationWithRsvp } from '@/lib/types'

export function InvitationDialog({
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
        {open && (
          <InvitationForm
            key={invitation?.id ?? 'new'}
            invitation={invitation}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function InvitationForm({ invitation, onDone }: { invitation: InvitationWithRsvp | null; onDone: () => void }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [values, setValues] = useState({
    partyName: invitation?.party_name ?? '',
    guestNames: invitation?.guest_names.join('\n') ?? '',
    email: invitation?.email ?? '',
    maxGuests: invitation?.max_guests ?? 2,
    notes: invitation?.notes ?? '',
  })

  const set = <K extends keyof typeof values>(k: K, v: (typeof values)[K]) => setValues((p) => ({ ...p, [k]: v }))

  function run(fn: () => Promise<{ ok: boolean; error?: string; fieldErrors?: Record<string, string> }>, success: string) {
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {})
        toast.error(res.error)
        return
      }
      toast.success(success)
      router.refresh()
      onDone()
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        run(() => saveInvitation(invitation?.id ?? null, values), invitation ? 'Invitation updated' : 'Invitation created')
      }}
      className="flex flex-col gap-5"
    >
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl font-normal">
          {invitation ? 'Edit invitation' : 'New invitation'}
        </DialogTitle>
        <DialogDescription>
          {invitation
            ? `Code ${invitation.code}`
            : 'A unique invitation code and personal RSVP link are generated automatically.'}
        </DialogDescription>
      </DialogHeader>

      <Field id="party-name" label="Party name" error={errors.partyName}>
        <Input
          id="party-name"
          value={values.partyName}
          onChange={(e) => set('partyName', e.target.value)}
          placeholder="The Harrington Family"
          maxLength={120}
          required
        />
      </Field>
      <Field id="guest-names" label="Invited guest names" hint="One per line" error={errors.guestNames}>
        <Textarea
          id="guest-names"
          value={values.guestNames}
          onChange={(e) => set('guestNames', e.target.value)}
          rows={3}
          placeholder={'Eleanor Harrington\nJames Harrington'}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
        <Field id="email" label="Email" hint="Optional" error={errors.email}>
          <Input id="email" type="email" value={values.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field id="max-guests" label="Seats allowed" error={errors.maxGuests}>
          <Input
            id="max-guests"
            type="number"
            min={1}
            max={12}
            value={values.maxGuests}
            onChange={(e) => set('maxGuests', Number(e.target.value))}
            required
          />
        </Field>
      </div>
      <Field id="notes" label="Private notes" hint="Only visible to admins" error={errors.notes}>
        <Textarea id="notes" value={values.notes} onChange={(e) => set('notes', e.target.value)} rows={2} />
      </Field>

      <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
        {invitation ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant={confirmDelete ? 'destructive' : 'ghost'}
              disabled={pending}
              onClick={() =>
                confirmDelete ? run(() => deleteInvitation(invitation.id), 'Invitation deleted') : setConfirmDelete(true)
              }
            >
              {confirmDelete ? 'Confirm delete' : 'Delete'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => run(() => regenerateAccess(invitation.id), 'New code and link generated')}
            >
              New code &amp; link
            </Button>
          </div>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={pending}>
          {invitation ? 'Save changes' : 'Create invitation'}
        </Button>
      </DialogFooter>
    </form>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {hint && <span className="font-normal text-muted-foreground">· {hint}</span>}
      </Label>
      {children}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
