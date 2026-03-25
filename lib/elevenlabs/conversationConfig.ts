import type { ConversationalConfig } from '@elevenlabs/elevenlabs-js/api/types/ConversationalConfig'

export const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'
export const DEFAULT_TTS_MODEL = 'eleven_turbo_v2_5'

export const buildConversationConfig = (input: {
  prompt: string
  firstMessage: string
  voiceId: string
}): ConversationalConfig => ({
  agent: {
    language: 'en',
    firstMessage: input.firstMessage.trim(),
    prompt: {
      prompt: input.prompt.trim(),
    },
  },
  tts: {
    modelId: DEFAULT_TTS_MODEL,
    voiceId: input.voiceId.trim() || DEFAULT_VOICE_ID,
  },
})
