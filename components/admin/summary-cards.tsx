import type { summarize } from '@/lib/admin-data'

export function SummaryCards({ summary }: { summary: ReturnType<typeof summarize> }) {
  const cards = [
    { label: 'Invited guests', value: summary.invitedGuests, note: `${summary.parties} invitations` },
    { label: 'Attending', value: summary.attendingGuests, note: `${summary.attendingParties} parties accepted` },
    { label: 'Declined', value: summary.declinedParties, note: 'parties' },
    { label: 'Pending', value: summary.pendingParties, note: `${summary.pendingSeats} seats awaiting reply` },
  ]
  return (
    <section aria-label="Summary" className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="flex flex-col gap-1 bg-card p-5 md:p-6">
          <p className="eyebrow text-[0.65rem] text-muted-foreground">{c.label}</p>
          <p className="font-serif text-4xl tabular-nums md:text-5xl">{c.value}</p>
          <p className="text-xs text-muted-foreground">{c.note}</p>
        </div>
      ))}
    </section>
  )
}
