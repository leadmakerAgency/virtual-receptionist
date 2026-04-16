/** Absolute coach URL when NEXT_PUBLIC_APP_URL is set; otherwise path-only. */
export const buildCoachUrl = (coachPublicId: string) => {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
  const path = `/${coachPublicId}`
  return base ? `${base}${path}` : path
}
