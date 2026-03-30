'use client'

import { useConversation as useElevenLabsConversation } from '@elevenlabs/react'
import { useState, useCallback } from 'react'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error.trim()) return error
  return fallback
}

export const useConversation = (
  agentId: string | null
) => {
  const [micMuted, setMicMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [lastError, setLastError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle')

  const conversation = useElevenLabsConversation({
    agentId: agentId || undefined,
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

  const getSignedUrl = useCallback(async (id: string) => {
    const response = await fetch('/api/conversations/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: id }),
    })

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

    const payload = (await response.json()) as { signed_url?: unknown }
    if (typeof payload.signed_url !== 'string' || !payload.signed_url.trim()) {
      throw new Error('Conversation signed URL was missing from the server response.')
    }
    return payload.signed_url
  }, [])

  const startSession = useCallback(async () => {
    if (!agentId) {
      throw new Error('Agent ID is required')
    }

    setLastError(null)
    setConnectionState('connecting')
    try {
      const signedUrl = await getSignedUrl(agentId)
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
  }, [agentId, conversation, getSignedUrl])

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
