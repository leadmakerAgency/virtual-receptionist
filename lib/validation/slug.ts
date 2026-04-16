const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Slugs that cannot be used — they collide with app routes or system paths. */
export const RESERVED_SLUGS = new Set([
  'admin',
  'login',
  'auth',
  'api',
  'coach',
  'public',
  'static',
  'next',
  // _next is not a valid slug (underscore) but listed for documentation parity
])

export const isValidSlug = (value: string) => SLUG_RE.test(value)

export const isReservedSlug = (value: string) => RESERVED_SLUGS.has(value.toLowerCase())

/** Valid non-reserved slug suitable for public coach URL `/{slug}`. */
export const isCoachSlug = (value: string) => isValidSlug(value) && !isReservedSlug(value)

/**
 * True when `pathname` is a single-segment path whose segment could be a coach slug
 * (caller should still validate against DB).
 */
export const isSingleSegmentPath = (pathname: string) => {
  const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
  if (normalized === '' || normalized === '/') return false
  const parts = normalized.split('/').filter(Boolean)
  return parts.length === 1
}

export const getSinglePathSegment = (pathname: string) => {
  const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
  const parts = normalized.split('/').filter(Boolean)
  return parts.length === 1 ? parts[0] : null
}
