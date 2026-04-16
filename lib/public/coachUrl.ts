/** Absolute coach URL when NEXT_PUBLIC_APP_URL is set; otherwise path-only. */
export const buildCoachUrl = (slug: string) => {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
  const path = `/${slug}`
  return base ? `${base}${path}` : path
}
