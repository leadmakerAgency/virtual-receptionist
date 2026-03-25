import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/isAdmin'

export const requireAdminApi = async (): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> => {
  const admin = await getAdminUser()
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }
  return { ok: true, userId: admin.user.id }
}
