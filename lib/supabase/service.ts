import 'server-only'
import { createClient } from '@supabase/supabase-js'

let serviceClient: ReturnType<typeof createClient> | null = null

/**
 * Service-role client that bypasses RLS. Only used by the guest RSVP server
 * actions, which verify an invitation code or secret token before every read
 * or write and only ever return data for that single invitation.
 */
export function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase is not configured: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set on the server.',
    )
  }
  serviceClient ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return serviceClient
}
