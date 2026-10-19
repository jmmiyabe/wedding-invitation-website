import { wedding } from '@/lib/wedding-config'
import { SectionHeading } from './ornaments'
import { Reveal } from './reveal'

export function Timeline() {
  return (
    <section id="schedule" aria-labelledby="schedule-title" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <SectionHeading id="schedule-title" eyebrow="Order of the day" title="The schedule" />
        </Reveal>
        <ol className="relative mt-16">
          <span aria-hidden="true" className="absolute inset-y-2 left-[5.5rem] w-px bg-gold/40 sm:left-1/2" />
          {wedding.timeline.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 60} className="relative grid grid-cols-[5.5rem_1fr] gap-x-8 pb-10 last:pb-0 sm:grid-cols-2 sm:gap-x-16">
              <span
                aria-hidden="true"
                className="absolute top-2.5 left-[5.5rem] size-2 -translate-x-1/2 rotate-45 bg-gold sm:left-1/2"
              />
              <p className="pt-0.5 font-serif text-lg italic text-sage-deep sm:text-right">{item.time}</p>
              <div>
                <h3 className="font-serif text-2xl">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
