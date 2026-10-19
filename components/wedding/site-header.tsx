import Link from 'next/link'
import { wedding } from '@/lib/wedding-config'

const links = [
  { href: '#details', label: 'Details' },
  { href: '#schedule', label: 'Schedule' },
  { href: '#notes', label: 'Notes' },
]

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 text-ivory md:px-8"
      >
        <Link href="/" className="font-serif text-xl tracking-wide">
          {wedding.partnerOne[0]}
          <span className="mx-1 italic text-ivory/80">&amp;</span>
          {wedding.partnerTwo[0]}
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="eyebrow text-ivory/85 transition-colors hover:text-ivory">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#rsvp"
          className="eyebrow rounded-full border border-ivory/60 px-4 py-2 text-ivory transition-colors hover:bg-ivory hover:text-sage-deep"
        >
          RSVP
        </a>
      </nav>
    </header>
  )
}
