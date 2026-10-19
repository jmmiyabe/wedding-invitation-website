'use client'

import Link from 'next/link'
import { useActionState, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { signInAction, signUpAction } from '@/app/actions/admin-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { wedding } from '@/lib/wedding-config'

export function AdminAuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [state, action, pending] = useActionState(mode === 'sign-in' ? signInAction : signUpAction, undefined)
  const [origin, setOrigin] = useState('')
  useEffect(() => setOrigin(window.location.origin), [])

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="font-serif text-3xl">
            {wedding.partnerOne} <span className="italic text-gold">&amp;</span> {wedding.partnerTwo}
          </p>
          <p className="eyebrow mt-3 text-muted-foreground">Guest list administration</p>
        </div>
        <form action={action} className="flex flex-col gap-5 rounded-sm border border-border bg-card p-6 sm:p-8">
          <h1 className="font-serif text-2xl">{mode === 'sign-in' ? 'Sign in' : 'Create admin account'}</h1>
          <input type="hidden" name="origin" value={origin} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              minLength={8}
              required
              className="h-11"
            />
          </div>
          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          {state?.notice && (
            <p role="status" className="rounded-sm bg-secondary p-3 text-sm text-secondary-foreground">
              {state.notice}
            </p>
          )}
          <Button type="submit" disabled={pending} className="h-11">
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'sign-in' ? (
            <>
              First time here?{' '}
              <Link href="/admin/sign-up" className="text-sage-deep underline underline-offset-4">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already registered?{' '}
              <Link href="/admin/login" className="text-sage-deep underline underline-offset-4">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  )
}
