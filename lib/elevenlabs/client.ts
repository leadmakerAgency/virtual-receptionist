import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

const DEFAULT_ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io'

export const getElevenLabsConfig = () => {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error(
      'Missing ELEVENLABS_API_KEY on the server. Set it in the deployment environment variables.'
    )
  }
  const baseUrl = process.env.ELEVENLABS_API_BASE_URL?.trim() || DEFAULT_ELEVENLABS_BASE_URL
  return { apiKey, baseUrl }
}

export const getElevenLabsClient = () => {
  const { apiKey, baseUrl } = getElevenLabsConfig()
  return new ElevenLabsClient({ apiKey, baseUrl })
}
