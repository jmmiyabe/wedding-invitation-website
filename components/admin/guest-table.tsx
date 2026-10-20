'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, Download, Pencil, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { InvitationWithRsvp, ResponseState } from '@/lib/types'
import { InvitationDialog } from './invitation-dialog'
import { RsvpDialog } from './rsvp-dialog'

const FILTERS: { value: ResponseState | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'attending', label: 'Attending' },
  { value: 'declined', label: 'Declined' },
  { value: 'pending', label: 'Pending' },
]

const STATUS_STYLE: Record<ResponseState, string> = {
  attending: 'bg-secondary text-sage-deep border-sage/40',
  declined: 'bg-muted text-muted-foreground border-border',
  pending: 'bg-gold/15 text-[#7a6230] border-gold/40',
}

function stateOf(inv: InvitationWithRsvp): ResponseState {
  return inv.rsvp?.status ?? 'pending'
}

export function GuestTable({ invitations, origin }: { invitations: InvitationWithRsvp[]; origin: string }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ResponseState | 'all'>('all')
  const [editingInvitation, setEditingInvitation] = useState<InvitationWithRsvp | 'new' | null>(null)
  const [editingRsvp, setEditingRsvp] = useState<InvitationWithRsvp | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c = { all: invitations.length, attending: 0, declined: 0, pending: 0 }
    for (const inv of invitations) c[stateOf(inv)]++
    return c
  }, [invitations])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return invitations.filter((inv) => {
      if (filter !== 'all' && stateOf(inv) !== filter) return false
      if (!q) return true
      return [inv.party_name, inv.code, inv.email ?? '', ...inv.guest_names, ...(inv.rsvp?.attendee_names ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [invitations, query, filter])

  async function copyLink(inv: InvitationWithRsvp) {
    try {
      await navigator.clipboard.writeText(`${origin}/rsvp/${inv.access_token}`)
      setCopiedId(inv.id)
      toast.success(`Personal link for ${inv.party_name} copied`)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <section aria-labelledby="guest-list-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 id="guest-list-title" className="font-serif text-2xl">
          Invitations
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" render={<a href="/api/admin/export" download />}>
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </Button>
          <Button onClick={() => setEditingInvitation('new')}>
            <Plus className="size-4" aria-hidden="true" />
            Add invitation
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, code or email"
            aria-label="Search invitations"
            className="h-10 bg-card pl-9"
          />
        </div>
        <div role="group" aria-label="Filter by response" className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                filter === f.value
                  ? 'border-sage-deep bg-sage-deep text-ivory'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label} <span className="tabular-nums opacity-70">{counts[f.value]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Party</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Seats</TableHead>
              <TableHead className="hidden lg:table-cell">Dietary</TableHead>
              <TableHead className="hidden md:table-cell">Code</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center text-muted-foreground">
                  {invitations.length === 0
                    ? 'No invitations yet. Add your first party to generate a code and personal link.'
                    : 'No invitations match your search.'}
                </TableCell>
              </TableRow>
            )}
            {visible.map((inv) => {
              const state = stateOf(inv)
              return (
                <TableRow key={inv.id}>
                  <TableCell className="max-w-[16rem] pl-4 whitespace-normal">
                    <p className="font-medium">{inv.party_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {(inv.rsvp?.attendee_names.length ? inv.rsvp.attendee_names : inv.guest_names).join(', ') ||
                        inv.email ||
                        '—'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize', STATUS_STYLE[state])}>
                      {state}
                    </Badge>
                    {inv.rsvp?.updated_by === 'admin' && (
                      <span className="ml-1.5 text-xs text-muted-foreground">(admin)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {inv.rsvp ? inv.rsvp.attendee_count : '–'}
                    <span className="text-muted-foreground"> / {inv.max_guests}</span>
                  </TableCell>
                  <TableCell className="hidden max-w-[14rem] truncate text-sm text-muted-foreground lg:table-cell">
                    {inv.rsvp?.dietary_requirements ?? '—'}
                  </TableCell>
                  <TableCell className="hidden font-mono text-sm tracking-wider md:table-cell">{inv.code}</TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => copyLink(inv)}
                        aria-label={`Copy personal link for ${inv.party_name}`}
                      >
                        {copiedId === inv.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditingInvitation(inv)}
                        aria-label={`Edit invitation for ${inv.party_name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingRsvp(inv)}>
                        RSVP
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <InvitationDialog
        invitation={editingInvitation === 'new' ? null : editingInvitation}
        open={editingInvitation !== null}
        onOpenChange={(open) => !open && setEditingInvitation(null)}
      />
      <RsvpDialog
        invitation={editingRsvp}
        open={editingRsvp !== null}
        onOpenChange={(open) => !open && setEditingRsvp(null)}
      />
    </section>
  )
}
