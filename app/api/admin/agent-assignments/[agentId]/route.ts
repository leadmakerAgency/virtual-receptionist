import { createRequestId, jsonError, jsonOk } from '@/lib/api/response'
import { requireAdminApiWithRequestId } from '@/lib/auth/requireAdminApi'
import { createAdminClient } from '@/lib/supabase/admin'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type PutBody = {
  userIds?: unknown
}

const parseUserIds = (value: unknown) => {
  if (!Array.isArray(value)) return null
  const normalized = value.filter((item): item is string => typeof item === 'string').map((id) => id.trim())
  if (normalized.some((id) => !UUID_REGEX.test(id))) {
    return null
  }
  return Array.from(new Set(normalized))
}

const validateAgentId = (agentId: string) => UUID_REGEX.test(agentId)

export async function GET(_request: Request, ctx: { params: Promise<{ agentId: string }> }) {
  const requestId = createRequestId()
  try {
    const gate = await requireAdminApiWithRequestId(requestId)
    if (!gate.ok) return gate.response

    const { agentId } = await ctx.params
    if (!validateAgentId(agentId)) {
      return jsonError(400, { error: 'Invalid agent id.', code: 'invalid_agent_id' }, requestId)
    }

    const adminClient = createAdminClient()
    const { data: agent, error: agentError } = await adminClient
      .from('virtual_receptionists')
      .select('id')
      .eq('id', agentId)
      .maybeSingle()

    if (agentError) {
      return jsonError(
        500,
        { error: 'Failed to validate agent.', code: 'agent_lookup_failed', details: agentError },
        requestId
      )
    }

    if (!agent) {
      return jsonError(404, { error: 'Agent not found.', code: 'agent_not_found' }, requestId)
    }

    const { data, error } = await adminClient
      .from('user_agent_assignments')
      .select('user_id')
      .eq('agent_record_id', agentId)

    if (error) {
      return jsonError(
        500,
        { error: 'Failed to load assignments.', code: 'load_assignments_failed', details: error },
        requestId
      )
    }

    const userIds = (data ?? []).map((row) => row.user_id)
    return jsonOk({ agentId, userIds }, 200, requestId)
  } catch (err) {
    console.error('GET /api/admin/agent-assignments/[agentId] unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Failed to load assignments'
    return jsonError(500, { error: message, code: 'internal_error' }, requestId)
  }
}

export async function PUT(request: Request, ctx: { params: Promise<{ agentId: string }> }) {
  const requestId = createRequestId()
  try {
    const gate = await requireAdminApiWithRequestId(requestId)
    if (!gate.ok) return gate.response

    const { agentId } = await ctx.params
    if (!validateAgentId(agentId)) {
      return jsonError(400, { error: 'Invalid agent id.', code: 'invalid_agent_id' }, requestId)
    }

    let body: PutBody
    try {
      body = (await request.json()) as PutBody
    } catch {
      return jsonError(400, { error: 'Invalid JSON body', code: 'invalid_json' }, requestId)
    }

    const userIds = parseUserIds(body.userIds)
    if (!userIds) {
      return jsonError(400, { error: 'userIds must be an array of UUID strings.', code: 'invalid_user_ids' }, requestId)
    }

    const adminClient = createAdminClient()
    const { data: agent, error: agentError } = await adminClient
      .from('virtual_receptionists')
      .select('id')
      .eq('id', agentId)
      .maybeSingle()

    if (agentError) {
      return jsonError(
        500,
        { error: 'Failed to validate agent.', code: 'agent_lookup_failed', details: agentError },
        requestId
      )
    }

    if (!agent) {
      return jsonError(404, { error: 'Agent not found.', code: 'agent_not_found' }, requestId)
    }

    if (userIds.length > 0) {
      const { data: users, error: usersError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
      if (usersError) {
        return jsonError(
          500,
          { error: 'Failed to validate users.', code: 'load_users_failed', details: usersError },
          requestId
        )
      }
      const existingUserIds = new Set((users.users ?? []).map((user) => user.id))
      const invalidUserIds = userIds.filter((userId) => !existingUserIds.has(userId))
      if (invalidUserIds.length > 0) {
        return jsonError(
          400,
          {
            error: 'One or more selected users are invalid.',
            code: 'invalid_user_reference',
            details: { invalidUserIds },
          },
          requestId
        )
      }
    }

    const { error: deleteError } = await adminClient
      .from('user_agent_assignments')
      .delete()
      .eq('agent_record_id', agentId)

    if (deleteError) {
      return jsonError(
        500,
        { error: 'Failed to clear existing assignments.', code: 'delete_assignments_failed', details: deleteError },
        requestId
      )
    }

    if (userIds.length > 0) {
      const rows = userIds.map((userId) => ({
        user_id: userId,
        agent_record_id: agentId,
      }))

      const { error: insertError } = await adminClient.from('user_agent_assignments').insert(rows)
      if (insertError) {
        return jsonError(
          500,
          { error: 'Failed to save assignments.', code: 'save_assignments_failed', details: insertError },
          requestId
        )
      }
    }

    return jsonOk({ ok: true, agentId, userIds }, 200, requestId)
  } catch (err) {
    console.error('PUT /api/admin/agent-assignments/[agentId] unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Failed to save assignments'
    return jsonError(500, { error: message, code: 'internal_error' }, requestId)
  }
}
