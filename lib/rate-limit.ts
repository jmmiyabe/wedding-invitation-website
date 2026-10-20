import 'server-only'
import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { getServiceClient } from '@/lib/supabase/service'

async function clientFingerprint() {
  const h = await headers()
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  // Store a hash, never the raw IP address.
  return createHash('sha256').update(ip).digest('hex').slice(0, 32)
}

/** Fixed-window limiter backed by Postgres. Returns true when the request is allowed. */
export async function rateLimit(scope: string, max: number, windowSeconds: number) {
  const key = `${scope}:${await clientFingerprint()}`
  const { data, error } = await getServiceClient().rpc('check_rate_limit', {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  } as never)
  if (error) {
    console.error('Rate limit check failed', error.message)
    return true
  }
  return data === true
}
