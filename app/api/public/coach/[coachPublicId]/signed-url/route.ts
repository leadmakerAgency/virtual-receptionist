import { createAdminClient } from '@/lib/supabase/admin'
import { ElevenLabsError, getConversationSignedUrl } from '@/lib/elevenlabs/httpFallback'
import { createRequestId, jsonError, jsonOk } from '@/lib/api/response'
import { isCoachPublicId } from '@/lib/validation/coachPublicId'

type Ctx = { params: Promise<{ coachPublicId: string }> }

export async function GET(_request: Request, ctx: Ctx) {
  const requestId = createRequestId()
  try {
    const { coachPublicId: raw } = await ctx.params
    const coachPublicId = decodeURIComponent(raw ?? '').trim()

    if (!coachPublicId || !isCoachPublicId(coachPublicId)) {
      return jsonError(404, { error: 'Not found', code: 'not_found' }, requestId)
    }

    const adminClient = createAdminClient()
    const { data: row, error } = await adminClient
      .from('virtual_receptionists')
      .select('agent_id, is_active')
      .eq('coach_public_id', coachPublicId)
      .maybeSingle()

    if (error || !row || !row.is_active || !row.agent_id) {
      return jsonError(404, { error: 'Not found', code: 'not_found' }, requestId)
    }

    const signedUrl = await getConversationSignedUrl(row.agent_id)
    return jsonOk({ signedUrl }, 200, requestId)
  } catch (err) {
    if (err instanceof ElevenLabsError) {
      return jsonError(
        err.statusCode && err.statusCode >= 400 ? err.statusCode : 502,
        {
          error: err.message,
          code: err.code ?? 'elevenlabs_error',
          details: err.details,
        },
        err.requestId ?? requestId
      )
    }
    console.error('GET public coach signed-url:', err)
    return jsonError(500, { error: 'Failed to create session', code: 'internal_error' }, requestId)
  }
}
