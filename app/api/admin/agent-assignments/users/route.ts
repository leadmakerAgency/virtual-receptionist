import { createRequestId, jsonError, jsonOk } from '@/lib/api/response'
import { requireAdminApiWithRequestId } from '@/lib/auth/requireAdminApi'
import { createAdminClient } from '@/lib/supabase/admin'

type AssignmentUser = {
  id: string
  email: string
  full_name: string | null
}

export async function GET() {
  const requestId = createRequestId()
  try {
    const gate = await requireAdminApiWithRequestId(requestId)
    if (!gate.ok) return gate.response

    const adminClient = createAdminClient()
    const [{ data: authData, error: authError }, { data: profiles, error: profilesError }] =
      await Promise.all([
        adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        adminClient.from('profiles').select('id, full_name'),
      ])

    if (authError) {
      return jsonError(
        500,
        { error: 'Failed to load auth users.', code: 'load_users_failed', details: authError },
        requestId
      )
    }

    if (profilesError) {
      return jsonError(
        500,
        { error: 'Failed to load user profiles.', code: 'load_profiles_failed', details: profilesError },
        requestId
      )
    }

    const fullNameByUserId = new Map<string, string | null>(
      (profiles ?? []).map((profile) => [profile.id, profile.full_name])
    )

    const users: AssignmentUser[] = (authData?.users ?? [])
      .filter((user) => Boolean(user.email))
      .map((user) => ({
        id: user.id,
        email: user.email ?? '',
        full_name: fullNameByUserId.get(user.id) ?? null,
      }))
      .sort((a, b) => a.email.localeCompare(b.email))

    return jsonOk({ users }, 200, requestId)
  } catch (err) {
    console.error('GET /api/admin/agent-assignments/users unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Failed to load users'
    return jsonError(500, { error: message, code: 'internal_error' }, requestId)
  }
}
