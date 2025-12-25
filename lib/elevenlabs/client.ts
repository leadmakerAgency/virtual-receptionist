import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error('ELEVENLABS_API_KEY is not set')
}

export const elevenlabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})
