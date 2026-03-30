import { NextResponse } from 'next/server'
import { getSessionWithProfile, isAdminUser } from '@/lib/auth/isAdmin'

export async function GET() {
  try {
    const session = await getSessionWithProfile()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      role: session.role,
      isAdmin: isAdminUser(session),
    })
  } catch (err) {
    console.error('GET /api/me failed:', err)
    const message = err instanceof Error ? err.message : 'Failed to fetch user profile'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
