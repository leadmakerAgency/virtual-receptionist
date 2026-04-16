import { getElevenLabsConfig } from '@/lib/elevenlabs/client'
import type { Json } from '@/types/database'

export type ElevenLabsProviderError = {
  message: string
  statusCode?: number
  code?: string
  requestId?: string
  details?: unknown
}

export class ElevenLabsError extends Error {
  statusCode?: number
  code?: string
  requestId?: string
  details?: unknown

  constructor(input: ElevenLabsProviderError) {
    super(input.message)
    this.name = 'ElevenLabsError'
    this.statusCode = input.statusCode
    this.code = input.code
    this.requestId = input.requestId
    this.details = input.details
  }
}

const normalizeErrorDetail = (raw: unknown): ElevenLabsProviderError => {
  const payload = raw as
    | { detail?: { message?: string; code?: string; request_id?: string; [k: string]: unknown } }
    | undefined
  const detail = payload?.detail
  return {
    message: detail?.message || 'ElevenLabs request failed',
    code: detail?.code,
    requestId: detail?.request_id,
    details: detail,
  }
}

const fetchJson = async <T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH',
  body?: unknown
): Promise<T> => {
  const { apiKey, baseUrl } = getElevenLabsConfig()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000)

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: method === 'GET' ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })

    const requestId = res.headers.get('x-request-id') ?? undefined
    const contentType = res.headers.get('content-type') ?? ''
    if (!res.ok) {
      if (contentType.includes('application/json')) {
        const json = (await res.json()) as unknown
        const normalized = normalizeErrorDetail(json)
        throw new ElevenLabsError({
          ...normalized,
          statusCode: res.status,
          requestId: normalized.requestId || requestId,
          details: json,
        })
      }

      const text = await res.text()
      throw new ElevenLabsError({
        message: text || `ElevenLabs request failed with status ${res.status}`,
        statusCode: res.status,
        requestId,
      })
    }

    if (!contentType.includes('application/json')) {
      throw new ElevenLabsError({
        message: 'ElevenLabs returned a non-JSON success response',
        statusCode: res.status,
        requestId,
      })
    }

    return (await res.json()) as T
  } catch (error) {
    if (error instanceof ElevenLabsError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ElevenLabsError({ message: 'ElevenLabs request timed out', code: 'timeout' })
    }
    const message = error instanceof Error ? error.message : 'Unknown ElevenLabs error'
    throw new ElevenLabsError({ message })
  } finally {
    clearTimeout(timeout)
  }
}

export const createAgentViaHttpFallback = async (request: {
  name: string
  conversation_config: Json
}) => {
  return fetchJson<{ agent_id?: string; agentId?: string }>(
    '/v1/convai/agents/create',
    'POST',
    request
  )
}

export const getAgentViaHttpFallback = async (agentId: string) => {
  return fetchJson<{
    agent_id?: string
    conversation_config?: {
      agent?: { first_message?: string; prompt?: { prompt?: string } }
      tts?: { voice_id?: string }
    }
  }>(`/v1/convai/agents/${encodeURIComponent(agentId)}`, 'GET')
}

export const updateAgentViaHttpFallback = async (
  agentId: string,
  request: {
    name?: string
    conversation_config: Json
  }
) => {
  return fetchJson<unknown>(`/v1/convai/agents/${encodeURIComponent(agentId)}`, 'PATCH', request)
}

/** Server-only: mint a short-lived WebSocket signed URL for ConvAI (see ElevenLabs docs). */
export const getConversationSignedUrl = async (agentId: string): Promise<string> => {
  const data = await fetchJson<Record<string, unknown>>(
    `/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    'GET'
  )
  const signedUrl = (data.signed_url ?? data.signedUrl) as unknown
  if (typeof signedUrl !== 'string' || !signedUrl.trim()) {
    throw new ElevenLabsError({
      message: 'ElevenLabs did not return a signed URL',
      code: 'missing_signed_url',
    })
  }
  return signedUrl.trim()
}

export const publishAgentViaHttpBestEffort = async (agentId: string) => {
  try {
    await fetchJson<unknown>(
      `/v1/convai/agents/${encodeURIComponent(agentId)}/deployments`,
      'POST',
      {}
    )
  } catch (error) {
    // Some workspaces/agent setups do not use deployments; this is best-effort and non-fatal.
    console.warn('ElevenLabs publish deployment skipped or failed:', error)
  }
}

export const normalizeSdkError = (err: unknown): ElevenLabsProviderError => {
  const maybe = err as {
    message?: string
    statusCode?: number
    body?: unknown
    rawResponse?: { headers?: Headers }
  }

  let requestId: string | undefined
  const headers = maybe.rawResponse?.headers
  if (headers && typeof headers.get === 'function') {
    requestId = headers.get('x-request-id') ?? undefined
  }

  if (maybe.body && typeof maybe.body === 'object') {
    const normalized = normalizeErrorDetail(maybe.body)
    return {
      message: normalized.message || maybe.message || 'ElevenLabs SDK request failed',
      statusCode: maybe.statusCode,
      code: normalized.code,
      requestId: normalized.requestId || requestId,
      details: maybe.body,
    }
  }

  return {
    message: maybe.message || 'ElevenLabs SDK request failed',
    statusCode: maybe.statusCode,
    requestId,
  }
}
