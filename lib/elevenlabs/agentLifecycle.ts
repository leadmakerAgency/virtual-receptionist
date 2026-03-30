import type { Json } from '@/types/database'
import { getElevenLabsClient } from '@/lib/elevenlabs/client'
import { buildConversationConfig } from '@/lib/elevenlabs/conversationConfig'

export const createElevenLabsAgentRecord = async (input: {
  name: string
  prompt: string
  firstMessage: string
  voiceId: string
}) => {
  const elevenlabsClient = getElevenLabsClient()
  const conversationConfig = buildConversationConfig(input)
  const created = await elevenlabsClient.conversationalAi.agents.create({
    name: input.name.trim(),
    conversationConfig,
  })
  return {
    agentId: created.agentId,
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
  const updated = await elevenlabsClient.conversationalAi.agents.update(agentId, {
    name: input.name?.trim(),
    conversationConfig,
  })
  return {
    agentConfigSnapshot: conversationConfig as unknown as Json,
    remote: updated,
  }
}
