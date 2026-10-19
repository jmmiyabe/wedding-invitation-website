import { isRsvpOpen, wedding } from '@/lib/wedding-config'
import type { GuestCredential, GuestInvitationView } from '@/lib/types'
import { SectionHeading } from './ornaments'
import { Reveal } from './reveal'
import { RsvpFlow } from './rsvp-flow'

export function RsvpSection({
  initial,
}: {
  initial?: { credential: GuestCredential; view: GuestInvitationView }
}) {
  const open = isRsvpOpen()
  return (
    <section id="rsvp" aria-labelledby="rsvp-title" className="scroll-mt-4 px-4 py-24 md:py-32">
      <Reveal className="mx-auto max-w-2xl">
        <SectionHeading id="rsvp-title" eyebrow="Répondez s’il vous plaît" title="Kindly reply" />
        <p className="mt-6 text-center font-serif text-xl italic text-sage-deep">
          {open ? `By ${wedding.rsvpDeadlineLabel}` : 'Our RSVP period has closed'}
        </p>
        <div className="mt-12 rounded-sm border border-gold/40 bg-card p-1.5 shadow-[0_30px_60px_-30px_rgba(46,53,41,0.25)]">
          <div className="rounded-[2px] border border-gold/25 px-5 py-10 sm:px-10 md:px-14 md:py-14">
            <RsvpFlow initial={initial} rsvpOpen={open} />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
