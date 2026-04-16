import { getSinglePathSegment } from '@/lib/validation/slug'

/** Public coach URL segment: opaque id (12 URL-safe alphanumeric chars). */
export const COACH_PUBLIC_ID_RE = /^[A-Za-z0-9]{12}$/

/** Reserved single-segment paths (case-insensitive) — block if generated (extremely unlikely). */
const RESERVED = new Set(['admin', 'login', 'auth', 'api', 'coach', 'public', 'static', 'next'])

export const isReservedCoachPublicId = (value: string) => RESERVED.has(value.toLowerCase())

export const isCoachPublicId = (value: string) =>
  COACH_PUBLIC_ID_RE.test(value) && !isReservedCoachPublicId(value)

/**
 * True when pathname is a single segment that could be a coach public id
 * (caller still resolves against DB).
 */
export const isPublicCoachPathname = (pathname: string) => {
  const segment = getSinglePathSegment(pathname)
  return segment !== null && isCoachPublicId(segment)
}
