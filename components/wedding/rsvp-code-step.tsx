'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RsvpCodeStep({
  onSubmit,
  pending,
  error,
}: {
  onSubmit: (code: string) => void
  pending: boolean
  error: string | null
}) {
  const [code, setCode] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (code.trim()) onSubmit(code)
      }}
      className="mx-auto flex max-w-sm flex-col items-center gap-6 text-center"
    >
      <p className="leading-relaxed text-muted-foreground text-pretty">
        Please enter the invitation code printed on your card, or use the personal link we sent you.
      </p>
      <div className="flex w-full flex-col gap-2 text-left">
        <Label htmlFor="invite-code" className="eyebrow text-sage-deep">
          Invitation code
        </Label>
        <Input
          id="invite-code"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. K7PQ2MXA"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={14}
          required
          aria-invalid={!!error}
          aria-describedby={error ? 'invite-code-error' : undefined}
          className="h-12 bg-card text-center font-serif text-2xl tracking-[0.3em] uppercase"
        />
        {error && (
          <p id="invite-code-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" disabled={pending || !code.trim()} className="h-12 w-full rounded-full eyebrow">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? 'Finding your invitation' : 'Find my invitation'}
      </Button>
    </form>
  )
}
