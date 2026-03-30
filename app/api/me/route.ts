import { getSessionWithProfile, isAdminUser } from '@/lib/auth/isAdmin'
import { createRequestId, jsonError, jsonOk } from '@/lib/api/response'

export async function GET() {
  const requestId = createRequestId()
  try {
    const session = await getSessionWithProfile()
    if (!session) {
      return jsonError(401, { error: 'Unauthorized', code: 'unauthorized' }, requestId)
    }

    return jsonOk(
      {
        id: session.user.id,
        email: session.user.email,
        role: session.role,
        isAdmin: isAdminUser(session),
      },
      200,
      requestId
    )
  } catch (err) {
    console.error('GET /api/me failed:', err)
    const message = err instanceof Error ? err.message : 'Failed to fetch user profile'
    return jsonError(500, { error: message, code: 'internal_error' }, requestId)
  }
}
