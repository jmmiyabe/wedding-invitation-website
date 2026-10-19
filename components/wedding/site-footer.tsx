import { wedding } from '@/lib/wedding-config'
import { FloralSprig } from './ornaments'

export function SiteFooter() {
  return (
    <footer className="px-6 pt-8 pb-16 text-center">
      <FloralSprig flip className="max-w-[14rem] opacity-80" />
      <p className="mt-4 font-serif text-3xl font-light">
        {wedding.partnerOne} <span className="italic text-gold">&amp;</span> {wedding.partnerTwo}
      </p>
      <p className="eyebrow mt-3 text-muted-foreground">{wedding.shortDate}</p>
      <p className="mt-8 text-sm text-muted-foreground">
        Questions? Write to us at{' '}
        <a href={`mailto:${wedding.contactEmail}`} className="text-sage-deep underline underline-offset-4">
          {wedding.contactEmail}
        </a>
      </p>
    </footer>
  )
}
