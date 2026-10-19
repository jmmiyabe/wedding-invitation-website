import Image from 'next/image'
import { wedding } from '@/lib/wedding-config'

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[100svh] items-end overflow-hidden">
      <Image
        src="/images/cover.png"
        alt={`${wedding.partnerOne} and ${wedding.partnerTwo} walking hand in hand through a summer meadow`}
        fill
        priority
        sizes="100vw"
        className="animate-in fade-in zoom-in-105 object-cover object-center duration-[2000ms]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#2e3529]/45 via-[#2e3529]/10 to-[#2e3529]/70"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-16 text-center text-ivory md:pb-24">
        <p className="eyebrow animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-300 duration-1000 text-ivory/90">
          The wedding of
        </p>
        <h1
          id="hero-title"
          className="mt-5 font-serif text-6xl font-light leading-[0.95] text-balance animate-in fade-in slide-in-from-bottom-3 fill-mode-both delay-500 duration-1000 sm:text-7xl md:text-8xl lg:text-9xl"
        >
          {wedding.partnerOne}
          <span className="block py-1 text-4xl italic text-ivory/85 sm:inline sm:px-5 sm:text-6xl md:text-7xl">
            &amp;
          </span>
          {wedding.partnerTwo}
        </h1>
        <div className="mt-8 flex flex-col items-center gap-2 animate-in fade-in fill-mode-both delay-700 duration-1000">
          <p className="font-serif text-xl italic md:text-2xl">{wedding.dateLabel}</p>
          <p className="eyebrow text-ivory/80">{wedding.location}</p>
        </div>
        <a
          href="#invitation"
          className="mt-12 flex flex-col items-center gap-2 text-ivory/80 transition-colors hover:text-ivory"
        >
          <span className="eyebrow">Scroll</span>
          <span aria-hidden="true" className="h-10 w-px animate-pulse bg-ivory/70" />
        </a>
      </div>
    </section>
  )
}
