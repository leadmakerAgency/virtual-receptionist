const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const isValidSlug = (value: string) => SLUG_RE.test(value)
