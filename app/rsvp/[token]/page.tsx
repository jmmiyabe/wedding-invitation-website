import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { lookupInvitation } from '@/app/actions/rsvp'
import { InvitationPage } from '@/components/wedding/invitation-page'
import { accessTokenSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function PersonalInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  if (!accessTokenSchema.safeParse(token).success) notFound()

  const credential = { type: 'token', value: token } as const
  const res = await lookupInvitation(credential)
  if (!res.ok) notFound()

  return <InvitationPage initial={{ credential, view: res.data }} />
}
