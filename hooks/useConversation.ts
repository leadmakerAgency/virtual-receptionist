'use client'

import { useConversation as useElevenLabsConversation } from '@elevenlabs/react'
import { useState, useCallback } from 'react'

export const useConversation = (agentId: string | null) => {
  const [micMuted, setMicMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
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
      setConnectionState('disconnected')
    },
  })

  const startSession = useCallback(async () => {
    if (!agentId) {
      throw new Error('Agent ID is required')
    }

    setConnectionState('connecting')
    try {
      await conversation.startSession({
        connectionType: 'webrtc',
      })
    } catch (error) {
      setConnectionState('disconnected')
      throw error
    }
  }, [agentId, conversation])

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
    connectionState,
    startSession,
    endSession,
    toggleMute,
    setVolume,
  }
}
