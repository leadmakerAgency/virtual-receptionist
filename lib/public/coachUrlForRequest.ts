import { headers } from 'next/headers'

import { buildCoachUrl } from '@/lib/public/coachUrl'

/**
 * Coach URL using the incoming request host (what the admin sees in the browser).
 * Matches Open / Copy link; avoids a stale NEXT_PUBLIC_APP_URL.
 */
export const buildCoachUrlForCurrentRequest = async (coachPublicId: string) => {
  const h = await headers()
  const host =
    h.get('x-forwarded-host')?.split(',')[0]?.trim() ?? h.get('host')?.trim() ?? ''
  if (!host) {
    return buildCoachUrl(coachPublicId)
  }
  const forwardedProto = h.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const proto =
    forwardedProto ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')
  return `${proto}://${host}/${coachPublicId}`
}
