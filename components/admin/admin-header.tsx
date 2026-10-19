import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { signOutAction } from '@/app/actions/admin-auth'
import { Button } from '@/components/ui/button'
import { wedding } from '@/lib/wedding-config'

export function AdminHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="font-serif text-xl">
          {wedding.partnerOne} <span className="italic text-gold">&amp;</span> {wedding.partnerTwo}
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
