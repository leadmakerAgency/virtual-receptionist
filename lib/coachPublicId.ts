import { isReservedCoachPublicId } from '@/lib/validation/coachPublicId'

const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
export const COACH_PUBLIC_ID_LENGTH = 12

/** Cryptographically random public coach URL segment (e.g. 12 chars). */
export const generateCoachPublicId = (): string => {
  const bytes = new Uint8Array(COACH_PUBLIC_ID_LENGTH)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < COACH_PUBLIC_ID_LENGTH; i++) {
    out += CHARSET[bytes[i] % CHARSET.length]
  }
  return out
}

/**
 * Generate an id that passes `isCoachPublicId` and is not reserved (retry on collision).
 */
export const generateUniqueCoachPublicId = async (
  isTaken: (id: string) => Promise<boolean>,
  maxAttempts = 32
): Promise<string> => {
  for (let a = 0; a < maxAttempts; a++) {
    let candidate = generateCoachPublicId()
    while (isReservedCoachPublicId(candidate)) {
      candidate = generateCoachPublicId()
    }
    if (!(await isTaken(candidate))) return candidate
  }
  throw new Error('Could not allocate a unique coach_public_id')
}
