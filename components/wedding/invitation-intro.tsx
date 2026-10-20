import { wedding } from '@/lib/wedding-config'
import { Countdown } from './countdown'
import { FloralSprig, GoldRule } from './ornaments'
import { Reveal } from './reveal'

export function InvitationIntro() {
  return (
    <section id="invitation" aria-label="Invitation" className="px-6 py-24 md:py-32">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <FloralSprig className="max-w-xs" />
        <p className="mt-6 font-serif text-2xl font-light leading-relaxed text-pretty md:text-3xl">
          {wedding.greeting}
        </p>
        <GoldRule className="my-10" />
        <p className="eyebrow text-sage-deep">{wedding.shortDate}</p>
        <p className="mt-3 font-serif text-lg italic text-muted-foreground">
          {wedding.venues[0].name}, {wedding.location}
        </p>
      </Reveal>
      <Reveal delay={150} className="mx-auto mt-20 max-w-3xl">
        <p className="eyebrow mb-8 text-center text-muted-foreground">Counting down</p>
        <Countdown targetISO={wedding.dateISO} />
      </Reveal>
    </section>
  )
}
