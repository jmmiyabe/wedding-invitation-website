import { wedding } from '@/lib/wedding-config'
import { SectionHeading } from './ornaments'
import { Reveal } from './reveal'

export function GuestNotes() {
  const { dressCode, reminders } = wedding
  return (
    <section id="notes" aria-labelledby="notes-title" className="bg-sage-deep px-6 py-24 text-ivory md:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal className="[&_.eyebrow]:text-ivory/70 [&_h2]:text-ivory">
          <SectionHeading id="notes-title" eyebrow="Kindly note" title="A few gentle details" />
        </Reveal>

        <Reveal delay={100} className="mx-auto mt-16 flex max-w-2xl flex-col items-center text-center">
          <p className="eyebrow text-gold">Dress code</p>
          <h3 className="mt-4 font-serif text-4xl font-light italic">{dressCode.title}</h3>
          <p className="mt-5 leading-relaxed text-pretty text-ivory/85">{dressCode.detail}</p>
          <ul aria-label="Suggested colour palette" className="mt-8 flex gap-3">
            {dressCode.palette.map((color) => (
              <li
                key={color}
                className="size-9 rounded-full ring-1 ring-ivory/40 ring-offset-2 ring-offset-sage-deep"
                style={{ backgroundColor: color }}
              >
                <span className="sr-only">{color}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-20 grid gap-px overflow-hidden rounded-sm bg-ivory/15 sm:grid-cols-2">
          {reminders.map((r, i) => (
            <Reveal key={r.title} delay={i * 80} className="bg-sage-deep p-8 md:p-10">
              <h3 className="font-serif text-2xl">{r.title}</h3>
              <p className="mt-3 leading-relaxed text-pretty text-ivory/80">{r.detail}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
