import type { Json } from '@/types/database'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApiWithRequestId } from '@/lib/auth/requireAdminApi'
import { updateElevenLabsAgent } from '@/lib/elevenlabs/agentLifecycle'
import { createRequestId, jsonError, jsonOk } from '@/lib/api/response'
import { ElevenLabsError } from '@/lib/elevenlabs/httpFallback'
import { generateUniqueCoachPublicId } from '@/lib/coachPublicId'

type PatchBody = {
  /** Ignored for persistence; if sent and differs from the row, rejected as immutable. */
  slug?: string
  name?: string
  prompt?: string
  first_message?: string
  voice_id?: string
  description?: string | null
  sort_order?: number
  is_active?: boolean
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const requestId = createRequestId()
  try {
    const gate = await requireAdminApiWithRequestId(requestId)
    if (!gate.ok) return gate.response

    const { id } = await ctx.params

    let body: PatchBody
    try {
      body = (await request.json()) as PatchBody
    } catch {
      return jsonError(400, { error: 'Invalid JSON body', code: 'invalid_json' }, requestId)
    }

    const adminClient = createAdminClient()
    const { data: existing, error: fetchError } = await adminClient
      .from('virtual_receptionists')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return jsonError(404, { error: 'Agent not found.', code: 'not_found' }, requestId)
    }

    if (!existing.agent_id) {
      return jsonError(
        400,
        { error: 'This record has no ElevenLabs agent id.', code: 'missing_agent_id' },
        requestId
      )
    }

    const slug = existing.slug
    if (body.slug !== undefined && body.slug.trim().toLowerCase() !== existing.slug) {
      return jsonError(
        400,
        { error: 'Slug cannot be changed after creation.', code: 'slug_immutable' },
        requestId
      )
    }

    const name = body.name !== undefined ? body.name.trim() : existing.name
    const prompt = body.prompt !== undefined ? body.prompt : (existing.prompt ?? '')
    const first_message =
      body.first_message !== undefined ? body.first_message : (existing.first_message ?? '')
    const voice_id =
      body.voice_id !== undefined ? body.voice_id.trim() : (existing.voice_id ?? '')

    if (!name) {
      return jsonError(400, { error: 'Name is required.', code: 'missing_name' }, requestId)
    }
    if (!String(prompt).trim()) {
      return jsonError(400, { error: 'Prompt is required.', code: 'missing_prompt' }, requestId)
    }
    if (!String(first_message).trim()) {
      return jsonError(
        400,
        { error: 'First message is required.', code: 'missing_first_message' },
        requestId
      )
    }

    let agentConfigSnapshot: Json | null = existing.agent_config
    try {
      const updated = await updateElevenLabsAgent(existing.agent_id, {
        name,
        prompt: String(prompt),
        firstMessage: String(first_message),
        voiceId: String(voice_id),
      })
      agentConfigSnapshot = updated.agentConfigSnapshot
    } catch (err) {
      console.error('ElevenLabs update agent failed:', err)
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
      const message = err instanceof Error ? err.message : 'Failed to update ElevenLabs agent'
      return jsonError(502, { error: message, code: 'elevenlabs_error' }, requestId)
    }

    const description =
      body.description !== undefined ? (body.description?.trim() ?? null) : existing.description
    const sort_order =
      typeof body.sort_order === 'number' ? body.sort_order : existing.sort_order ?? 0
    const is_active = body.is_active !== undefined ? body.is_active : existing.is_active

    let coach_public_id = existing.coach_public_id
    if (!coach_public_id) {
      coach_public_id = await generateUniqueCoachPublicId(async (candidate) => {
        const { data: clash } = await adminClient
          .from('virtual_receptionists')
          .select('id')
          .eq('coach_public_id', candidate)
          .neq('id', id)
          .maybeSingle()
        return Boolean(clash)
      })
    }

    const { error: saveError } = await adminClient
      .from('virtual_receptionists')
      .update({
        slug,
        coach_public_id,
        name,
        prompt,
        first_message,
        voice_id: voice_id || null,
        agent_config: agentConfigSnapshot,
        description,
        sort_order,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (saveError) {
      console.error('Supabase update after ElevenLabs:', saveError)
      return jsonError(
        500,
        {
          error: 'ElevenLabs was updated but saving to the database failed.',
          code: 'db_update_failed',
          details: saveError,
        },
        requestId
      )
    }

    return jsonOk({ ok: true }, 200, requestId)
  } catch (err) {
    console.error('PATCH /api/admin/agents/[id] unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Failed to update agent'
    return jsonError(500, { error: message, code: 'internal_error' }, requestId)
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const requestId = createRequestId()
  try {
    const gate = await requireAdminApiWithRequestId(requestId)
    if (!gate.ok) return gate.response

    const { id } = await ctx.params
    const adminClient = createAdminClient()

    const { data: existing, error: fetchError } = await adminClient
      .from('virtual_receptionists')
      .select('agent_id, is_active')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return jsonError(404, { error: 'Agent not found.', code: 'not_found' }, requestId)
    }

    const { error } = await adminClient
      .from('virtual_receptionists')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return jsonError(
        500,
        { error: 'Failed to deactivate agent.', code: 'db_update_failed', details: error },
        requestId
      )
    }

    return jsonOk({ ok: true }, 200, requestId)
  } catch (err) {
    console.error('DELETE /api/admin/agents/[id] unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Failed to deactivate agent'
    return jsonError(500, { error: message, code: 'internal_error' }, requestId)
  }
}
