import type { ConversationalConfig } from '@elevenlabs/elevenlabs-js/api/types/ConversationalConfig'
import type { Json } from '@/types/database'

export const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'
/** English ConvAI agents: ElevenLabs accepts flash/turbo v2, not *_v2_5. */
export const DEFAULT_TTS_MODEL = 'eleven_flash_v2'

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

export const buildConversationConfigHttpPayload = (input: {
  prompt: string
  firstMessage: string
  voiceId: string
}): Json => ({
  agent: {
    language: 'en',
    first_message: input.firstMessage.trim(),
    prompt: {
      prompt: input.prompt.trim(),
    },
  },
  tts: {
    model_id: DEFAULT_TTS_MODEL,
    voice_id: input.voiceId.trim() || DEFAULT_VOICE_ID,
  },
})
