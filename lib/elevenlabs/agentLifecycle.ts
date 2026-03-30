import type { Json } from '@/types/database'
import { getElevenLabsClient } from '@/lib/elevenlabs/client'
import { buildConversationConfig } from '@/lib/elevenlabs/conversationConfig'
import {
  createAgentViaHttpFallback,
  ElevenLabsError,
  getAgentViaHttpFallback,
  normalizeSdkError,
  publishAgentViaHttpBestEffort,
  updateAgentViaHttpFallback,
} from '@/lib/elevenlabs/httpFallback'
import { buildConversationConfigHttpPayload } from '@/lib/elevenlabs/conversationConfig'

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

const withHttpPrimaryFallback = async <T, U>(
  operation: () => Promise<T>,
  fallback: () => Promise<U>
): Promise<T | U> => {
  try {
    return await operation()
  } catch (httpError) {
    if (httpError instanceof ElevenLabsError) {
      console.warn('ElevenLabs HTTP call failed, trying SDK fallback:', httpError)
    } else {
      console.warn('ElevenLabs HTTP call failed, trying SDK fallback:', httpError)
    }
    return withFallback(fallback, operation)
  }
}

const assertAgentConfigSynced = async (
  agentId: string,
  expected: { prompt: string; firstMessage: string; voiceId: string }
) => {
  const remote = await getAgentViaHttpFallback(agentId)
  const remotePrompt = remote.conversation_config?.agent?.prompt?.prompt?.trim() ?? ''
  const remoteFirstMessage = remote.conversation_config?.agent?.first_message?.trim() ?? ''
  const remoteVoiceId = remote.conversation_config?.tts?.voice_id?.trim() ?? ''

  if (
    remotePrompt !== expected.prompt.trim() ||
    remoteFirstMessage !== expected.firstMessage.trim() ||
    (remoteVoiceId && remoteVoiceId !== expected.voiceId.trim())
  ) {
    throw new ElevenLabsError({
      message:
        'ElevenLabs agent settings were not fully synced (prompt/first message/voice). Please retry the update.',
      code: 'agent_sync_mismatch',
      details: {
        remotePrompt,
        remoteFirstMessage,
        remoteVoiceId,
        expectedPrompt: expected.prompt.trim(),
        expectedFirstMessage: expected.firstMessage.trim(),
        expectedVoiceId: expected.voiceId.trim(),
      },
    })
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
  const conversationConfigHttp = buildConversationConfigHttpPayload(input)
  const created = await withHttpPrimaryFallback(
    () =>
      createAgentViaHttpFallback({
        name: input.name.trim(),
        conversation_config: conversationConfigHttp,
      }),
    () =>
      elevenlabsClient.conversationalAi.agents.create({
        name: input.name.trim(),
        conversationConfig,
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

  await assertAgentConfigSynced(createdAgentId, {
    prompt: input.prompt,
    firstMessage: input.firstMessage,
    voiceId: input.voiceId,
  })
  await publishAgentViaHttpBestEffort(createdAgentId)

  return {
    agentId: createdAgentId,
    agentConfigSnapshot: conversationConfigHttp,
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
  const conversationConfigHttp = buildConversationConfigHttpPayload(input)
  await withHttpPrimaryFallback(
    () =>
      updateAgentViaHttpFallback(agentId, {
        name: input.name?.trim(),
        conversation_config: conversationConfigHttp,
      }),
    () =>
      elevenlabsClient.conversationalAi.agents.update(agentId, {
        name: input.name?.trim(),
        conversationConfig,
      })
  )

  await assertAgentConfigSynced(agentId, {
    prompt: input.prompt,
    firstMessage: input.firstMessage,
    voiceId: input.voiceId,
  })
  await publishAgentViaHttpBestEffort(agentId)

  return {
    agentConfigSnapshot: conversationConfigHttp,
  }
}
