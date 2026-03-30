import { getAdminUser } from '@/lib/auth/isAdmin'
import { jsonError } from '@/lib/api/response'

export const requireAdminApi = async (): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: Response }
> => {
  return requireAdminApiWithRequestId()
}

export const requireAdminApiWithRequestId = async (
  requestId?: string
): Promise<{ ok: true; userId: string } | { ok: false; response: Response }> => {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return {
        ok: false,
        response: jsonError(403, { error: 'Forbidden', code: 'forbidden' }, requestId),
      }
    }
    return { ok: true, userId: admin.user.id }
  } catch (err) {
    console.error('requireAdminApi failed:', err)
    return {
      ok: false,
      response: jsonError(
        500,
        { error: 'Admin auth check failed', code: 'admin_auth_check_failed' },
        requestId
      ),
    }
  }
}
