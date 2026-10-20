import Image from 'next/image'
import { cn } from '@/lib/utils'

export function FloralSprig({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none relative mx-auto aspect-[2.4/1] w-full max-w-sm', className)}
      style={{
        maskImage: 'radial-gradient(ellipse 48% 42% at center, black 55%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 48% 42% at center, black 55%, transparent 100%)',
      }}
    >
      <Image
        src="/images/floral-sprig.png"
        alt=""
        fill
        sizes="(min-width: 640px) 384px, 90vw"
        className={cn('object-cover mix-blend-multiply', flip && '-scale-x-100')}
      />
    </div>
  )
}

export function GoldRule({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('flex items-center justify-center gap-3 text-gold', className)}>
      <span className="h-px w-12 bg-gold/60" />
      <svg width="8" height="8" viewBox="0 0 8 8" className="fill-current">
        <path d="M4 0 L8 4 L4 8 L0 4 Z" />
      </svg>
      <span className="h-px w-12 bg-gold/60" />
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  className,
  id,
}: {
  eyebrow: string
  title: string
  className?: string
  id?: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-4 text-center', className)}>
      <p className="eyebrow text-sage-deep">{eyebrow}</p>
      <h2 id={id} className="font-serif text-4xl font-light leading-tight text-balance md:text-5xl">
        {title}
      </h2>
      <GoldRule />
    </div>
  )
}
