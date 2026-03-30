import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

export const getElevenLabsClient = () => {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error(
      'Missing ELEVENLABS_API_KEY on the server. Set it in the deployment environment variables.'
    )
  }
  return new ElevenLabsClient({ apiKey })
}
