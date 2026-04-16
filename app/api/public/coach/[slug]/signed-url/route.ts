import { createAdminClient } from '@/lib/supabase/admin'
import { ElevenLabsError, getConversationSignedUrl } from '@/lib/elevenlabs/httpFallback'
import { createRequestId, jsonError, jsonOk } from '@/lib/api/response'
import { isCoachSlug } from '@/lib/validation/slug'

type Ctx = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, ctx: Ctx) {
  const requestId = createRequestId()
  try {
    const { slug: raw } = await ctx.params
    const slug = decodeURIComponent(raw ?? '').trim().toLowerCase()

    if (!slug || !isCoachSlug(slug)) {
      return jsonError(404, { error: 'Not found', code: 'not_found' }, requestId)
    }

    const adminClient = createAdminClient()
    const { data: row, error } = await adminClient
      .from('virtual_receptionists')
      .select('agent_id, is_active')
      .eq('slug', slug)
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
