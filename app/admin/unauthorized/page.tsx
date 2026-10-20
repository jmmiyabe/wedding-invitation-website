import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/app/actions/admin-auth'
import { Button } from '@/components/ui/button'
import { getAdminContext } from '@/lib/auth'

export const metadata: Metadata = { title: 'Not authorized', robots: { index: false } }

export default async function UnauthorizedPage() {
  const ctx = await getAdminContext()
  if (ctx.status === 'admin') redirect('/admin')
  if (ctx.status === 'unauthenticated') redirect('/admin/login')

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl">Access not granted</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          You are signed in as <strong className="font-medium text-foreground">{ctx.email}</strong>, but this
          address is not on the administrator allow-list. Ask the couple to add it, then sign in again.
        </p>
        <form action={signOutAction} className="mt-8">
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  )
}
