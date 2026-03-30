import type { Json } from '@/types/database'
import { getElevenLabsClient } from '@/lib/elevenlabs/client'
import { buildConversationConfig } from '@/lib/elevenlabs/conversationConfig'
import {
  createAgentViaHttpFallback,
  ElevenLabsError,
  normalizeSdkError,
  updateAgentViaHttpFallback,
} from '@/lib/elevenlabs/httpFallback'

const withFallback = async <T, U>(
  operation: () => Promise<T>,
  fallback: () => Promise<U>
): Promise<T | U> => {
  try {
    return await operation()
  } catch (sdkError) {
    const normalized = normalizeSdkError(sdkError)
    console.warn('ElevenLabs SDK call failed, trying HTTP fallback:', normalized)
    try {
      return await fallback()
    } catch (httpError) {
      if (httpError instanceof ElevenLabsError) {
        throw httpError
      }
      throw new ElevenLabsError({
        message: normalized.message,
        statusCode: normalized.statusCode,
        code: normalized.code,
        requestId: normalized.requestId,
        details: normalized.details,
      })
    }
  }
}

export const createElevenLabsAgentRecord = async (input: {
  name: string
  prompt: string
  firstMessage: string
  voiceId: string
}) => {
  const elevenlabsClient = getElevenLabsClient()
  const conversationConfig = buildConversationConfig(input)
  const created = await withFallback(
    () =>
      elevenlabsClient.conversationalAi.agents.create({
        name: input.name.trim(),
        conversationConfig,
      }),
    () =>
      createAgentViaHttpFallback({
        name: input.name.trim(),
        conversation_config: conversationConfig as unknown as Json,
      })
  )

  const createdAgentId =
    (created as { agentId?: string }).agentId ?? (created as { agent_id?: string }).agent_id
  if (!createdAgentId) {
    throw new ElevenLabsError({
      message: 'ElevenLabs did not return an agent id after creation',
      code: 'missing_agent_id',
    })
  }

  return {
    agentId: createdAgentId,
    agentConfigSnapshot: conversationConfig as unknown as Json,
  }
}

export const updateElevenLabsAgent = async (
  agentId: string,
  input: {
    name?: string
    prompt: string
    firstMessage: string
    voiceId: string
  }
) => {
  const elevenlabsClient = getElevenLabsClient()
  const conversationConfig = buildConversationConfig(input)
  await withFallback(
    () =>
      elevenlabsClient.conversationalAi.agents.update(agentId, {
        name: input.name?.trim(),
        conversationConfig,
      }),
    () =>
      updateAgentViaHttpFallback(agentId, {
        name: input.name?.trim(),
        conversation_config: conversationConfig as unknown as Json,
      })
  )

  return {
    agentConfigSnapshot: conversationConfig as unknown as Json,
  }
}
