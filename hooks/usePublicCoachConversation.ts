'use client'

import { useConversation as useElevenLabsConversation } from '@elevenlabs/react'
import { useState, useCallback } from 'react'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error.trim()) return error
  return fallback
}

export const usePublicCoachConversation = (publicCoachId: string) => {
  const [micMuted, setMicMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [lastError, setLastError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<
    'idle' | 'connecting' | 'connected' | 'disconnected'
  >('idle')

  const conversation = useElevenLabsConversation({
    micMuted,
    volume,
    onConnect: () => {
      setConnectionState('connected')
    },
    onDisconnect: () => {
      setConnectionState('disconnected')
    },
    onError: (error) => {
      console.error('Conversation error:', error)
      const message = getErrorMessage(error, 'Conversation connection failed.')
      setLastError(message)
      setConnectionState('disconnected')
    },
  })

  const fetchSignedUrl = useCallback(async () => {
    const response = await fetch(
      `/api/public/coach/${encodeURIComponent(publicCoachId)}/signed-url`
    )

    if (!response.ok) {
      let payload: { error?: unknown } | null = null
      try {
        payload = (await response.json()) as { error?: unknown }
      } catch {
        payload = null
      }
      const message =
        payload && typeof payload.error === 'string'
          ? payload.error
          : `Failed to create conversation auth URL (status ${response.status}).`
      throw new Error(message)
    }

    const payload = (await response.json()) as { signedUrl?: unknown }
    if (typeof payload.signedUrl !== 'string' || !payload.signedUrl.trim()) {
      throw new Error('Conversation signed URL was missing from the server response.')
    }
    return payload.signedUrl.trim()
  }, [publicCoachId])

  const startSession = useCallback(async () => {
    if (!publicCoachId) {
      throw new Error('Coach session is not ready')
    }

    setLastError(null)
    setConnectionState('connecting')
    try {
      const signedUrl = await fetchSignedUrl()
      await conversation.startSession({
        signedUrl,
        connectionType: 'websocket',
      })
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to start the conversation session.')
      setLastError(message)
      setConnectionState('disconnected')
      throw error
    }
  }, [publicCoachId, conversation, fetchSignedUrl])

  const endSession = useCallback(async () => {
    try {
      await conversation.endSession()
      setConnectionState('idle')
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }, [conversation])

  const toggleMute = useCallback(() => {
    setMicMuted((prev) => !prev)
  }, [])

  return {
    ...conversation,
    micMuted,
    volume,
    lastError,
    connectionState,
    startSession,
    endSession,
    toggleMute,
    setVolume,
  }
}
