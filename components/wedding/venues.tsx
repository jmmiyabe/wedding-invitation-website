import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { getMapsUrl, wedding } from '@/lib/wedding-config'
import { SectionHeading } from './ornaments'
import { Reveal } from './reveal'

export function Venues() {
  return (
    <section id="details" aria-labelledby="details-title" className="bg-muted/60 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading id="details-title" eyebrow="Where & when" title="The celebration" />
        </Reveal>

        <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-0">
          {wedding.venues.map((venue, i) => (
            <Reveal
              key={venue.name}
              delay={i * 150}
              className="flex flex-col items-center text-center md:px-12 md:first:border-r md:first:border-gold/30"
            >
              <p className="eyebrow text-gold">{venue.label}</p>
              <h3 className="mt-4 font-serif text-3xl md:text-4xl">{venue.name}</h3>
              <p className="mt-2 font-serif text-lg italic text-sage-deep">{venue.time}</p>
              <address className="mt-6 not-italic leading-relaxed text-muted-foreground">
                {venue.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p className="mt-6 max-w-sm leading-relaxed text-pretty">{venue.description}</p>
              <a
                href={getMapsUrl(venue.mapsQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow mt-8 inline-flex items-center gap-2 border-b border-gold/60 pb-1 text-sage-deep transition-colors hover:border-sage-deep"
              >
                <MapPin className="size-3.5" aria-hidden="true" />
                Open in Google Maps
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="relative mt-20 aspect-[4/3] overflow-hidden rounded-sm md:aspect-[21/9]">
          <Image
            src="/images/venue.png"
            alt="A candlelit long table set beneath an oak tree in the walled garden at Hollyhock House"
            fill
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </section>
  )
}
