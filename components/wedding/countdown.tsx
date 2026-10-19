'use client'

import { useEffect, useState } from 'react'

function diff(target: number, now: number) {
  const ms = Math.max(0, target - now)
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  }
}

export function Countdown({ targetISO }: { targetISO: string }) {
  const target = new Date(targetISO).getTime()
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const t = now === null ? null : diff(target, now)

  if (t?.done) {
    return <p className="font-serif text-3xl italic text-sage-deep">Today is the day.</p>
  }

  const units = [
    { label: 'Days', value: t?.days },
    { label: 'Hours', value: t?.hours },
    { label: 'Minutes', value: t?.minutes },
    { label: 'Seconds', value: t?.seconds },
  ]

  return (
    <div role="timer" aria-label="Countdown to the wedding" className="flex items-start justify-center">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-start">
          {i > 0 && (
            <span aria-hidden="true" className="px-3 font-serif text-4xl font-light text-gold/70 sm:px-6 md:text-5xl">
              ·
            </span>
          )}
          <div className="flex w-14 flex-col items-center gap-2 sm:w-20">
            <span
              className="font-serif text-4xl font-light tabular-nums text-foreground md:text-6xl"
              aria-live={u.label === 'Days' ? 'polite' : 'off'}
            >
              {u.value === undefined ? '—' : String(u.value).padStart(2, '0')}
            </span>
            <span className="eyebrow text-[0.6rem] text-muted-foreground">{u.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
