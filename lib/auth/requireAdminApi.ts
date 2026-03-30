import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/isAdmin'

export const requireAdminApi = async (): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> => {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      }
    }
    return { ok: true, userId: admin.user.id }
  } catch (err) {
    console.error('requireAdminApi failed:', err)
    return {
      ok: false,
      response: NextResponse.json({ error: 'Admin auth check failed' }, { status: 500 }),
    }
  }
}
