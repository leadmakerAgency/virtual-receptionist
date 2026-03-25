import { NextResponse } from 'next/server'
import { getSessionWithProfile, isAdminUser } from '@/lib/auth/isAdmin'

export async function GET() {
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
}
