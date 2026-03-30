import { createRequestId, jsonError, jsonOk } from '@/lib/api/response'
import { getElevenLabsConfig } from '@/lib/elevenlabs/client'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type RequestBody = {
  agent_id?: unknown
}

export async function POST(request: Request) {
  const requestId = createRequestId()
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return jsonError(401, { error: 'Unauthorized', code: 'unauthorized' }, requestId)
    }

    let body: RequestBody
    try {
      body = (await request.json()) as RequestBody
    } catch {
      return jsonError(400, { error: 'Invalid JSON body', code: 'invalid_json' }, requestId)
    }

    const agentId = typeof body.agent_id === 'string' ? body.agent_id.trim() : ''
    if (!agentId) {
      return jsonError(400, { error: 'agent_id is required', code: 'missing_agent_id' }, requestId)
    }

    const { apiKey, baseUrl } = getElevenLabsConfig()
    const upstream = await fetch(
      `${baseUrl}/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    )

    const upstreamRequestId = upstream.headers.get('x-request-id') ?? undefined
    const contentType = upstream.headers.get('content-type') ?? ''
    if (!upstream.ok) {
      if (contentType.includes('application/json')) {
        const details = (await upstream.json()) as unknown
        const message =
          typeof (details as { detail?: { message?: unknown } })?.detail?.message === 'string'
            ? ((details as { detail?: { message?: string } }).detail?.message ?? 'Failed to request signed URL')
            : 'Failed to request signed URL from ElevenLabs'
        return jsonError(
          upstream.status,
          {
            error: message,
            code: 'elevenlabs_signed_url_failed',
            details,
            requestId: upstreamRequestId ?? requestId,
          },
          upstreamRequestId ?? requestId
        )
      }

      const text = await upstream.text()
      return jsonError(
        upstream.status,
        {
          error: text || 'Failed to request signed URL from ElevenLabs',
          code: 'elevenlabs_signed_url_failed',
          requestId: upstreamRequestId ?? requestId,
        },
        upstreamRequestId ?? requestId
      )
    }

    const payload = (await upstream.json()) as { signed_url?: unknown }
    if (typeof payload.signed_url !== 'string' || !payload.signed_url.trim()) {
      return jsonError(
        502,
        { error: 'ElevenLabs did not return a valid signed URL', code: 'invalid_signed_url' },
        upstreamRequestId ?? requestId
      )
    }

    return jsonOk({ signed_url: payload.signed_url }, 200, upstreamRequestId ?? requestId)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create signed URL'
    return jsonError(500, { error: message, code: 'internal_error' }, requestId)
  }
}
