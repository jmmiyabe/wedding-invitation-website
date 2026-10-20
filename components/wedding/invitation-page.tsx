import type { GuestCredential, GuestInvitationView } from '@/lib/types'
import { GuestNotes } from './guest-notes'
import { Hero } from './hero'
import { InvitationIntro } from './invitation-intro'
import { RsvpSection } from './rsvp-section'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'
import { Timeline } from './timeline'
import { Venues } from './venues'

export function InvitationPage({
  initial,
}: {
  initial?: { credential: GuestCredential; view: GuestInvitationView }
}) {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <InvitationIntro />
        <Venues />
        <Timeline />
        <GuestNotes />
        <RsvpSection initial={initial} />
      </main>
      <SiteFooter />
    </>
  )
}
