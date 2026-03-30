import type { Json } from '@/types/database'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApiWithRequestId } from '@/lib/auth/requireAdminApi'
import { createElevenLabsAgentRecord } from '@/lib/elevenlabs/agentLifecycle'
import { createRequestId, jsonError, jsonOk } from '@/lib/api/response'
import { ElevenLabsError } from '@/lib/elevenlabs/httpFallback'
import { isValidSlug } from '@/lib/validation/slug'

type CreateBody = {
  slug?: string
  name?: string
  prompt?: string
  first_message?: string
  voice_id?: string
  description?: string | null
  sort_order?: number
  is_active?: boolean
}

export async function POST(request: Request) {
  const requestId = createRequestId()
  try {
    console.info('[admin-agents:create] start', { requestId })
    const gate = await requireAdminApiWithRequestId(requestId)
    if (!gate.ok) return gate.response

    let body: CreateBody
    try {
      body = (await request.json()) as CreateBody
    } catch {
      return jsonError(400, { error: 'Invalid JSON body', code: 'invalid_json' }, requestId)
    }

    const slug = (body.slug ?? '').trim().toLowerCase()
    const name = (body.name ?? '').trim()
    const prompt = body.prompt ?? ''
    const first_message = body.first_message ?? ''
    const voice_id = (body.voice_id ?? '').trim()
    const description = body.description?.trim() ?? null

    if (!slug || !isValidSlug(slug)) {
      return jsonError(
        400,
        {
          error: 'Slug must be lowercase letters, numbers, and single hyphens between words.',
          code: 'invalid_slug',
        },
        requestId
      )
    }
    if (!name) {
      return jsonError(400, { error: 'Name is required.', code: 'missing_name' }, requestId)
    }
    if (!prompt.trim()) {
      return jsonError(400, { error: 'Prompt is required.', code: 'missing_prompt' }, requestId)
    }
    if (!first_message.trim()) {
      return jsonError(
        400,
        { error: 'First message is required.', code: 'missing_first_message' },
        requestId
      )
    }

    const adminClient = createAdminClient()

    const { data: existing } = await adminClient
      .from('virtual_receptionists')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return jsonError(409, { error: 'That slug is already in use.', code: 'slug_conflict' }, requestId)
    }

    let agentId: string
    let agentConfigSnapshot: Json

    try {
      console.info('[admin-agents:create] elevenlabs-create:start', { requestId })
      const created = await createElevenLabsAgentRecord({
        name,
        prompt,
        firstMessage: first_message,
        voiceId: voice_id,
      })
      agentId = created.agentId
      agentConfigSnapshot = created.agentConfigSnapshot
      console.info('[admin-agents:create] elevenlabs-create:success', { requestId, agentId })
    } catch (err) {
      console.error('ElevenLabs create agent failed:', err)
      if (err instanceof ElevenLabsError) {
        return jsonError(
          err.statusCode && err.statusCode >= 400 ? err.statusCode : 502,
          {
            error: err.message,
            code: err.code ?? 'elevenlabs_error',
            details: err.details,
            requestId: err.requestId ?? requestId,
          },
          err.requestId ?? requestId
        )
      }
      const message = err instanceof Error ? err.message : 'Failed to create ElevenLabs agent'
      return jsonError(502, { error: message, code: 'elevenlabs_error' }, requestId)
    }

    const { data: row, error } = await adminClient
      .from('virtual_receptionists')
      .insert({
        slug,
        name,
        prompt,
        first_message,
        voice_id: voice_id || null,
        agent_id: agentId,
        agent_config: agentConfigSnapshot,
        description,
        sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
        is_active: body.is_active !== false,
        created_by: gate.userId,
      })
      .select('id')
      .single()

    if (error || !row) {
      console.error('Supabase insert after ElevenLabs create:', error)
      return jsonError(
        500,
        {
          error:
            'Agent was created in ElevenLabs but saving to the database failed. Remove the orphan agent in ElevenLabs or retry.',
          code: 'db_persist_failed',
          details: error,
        },
        requestId
      )
    }

    console.info('[admin-agents:create] db-insert:success', { requestId, id: row.id, agentId })
    return jsonOk({ id: row.id, agent_id: agentId }, 201, requestId)
  } catch (err) {
    console.error('POST /api/admin/agents unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create agent'
    return jsonError(500, { error: message, code: 'internal_error' }, requestId)
  }
}
