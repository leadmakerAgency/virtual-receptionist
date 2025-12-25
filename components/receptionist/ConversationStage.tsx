'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, PhoneOff, Clock } from 'lucide-react'
import { AudioVisualizer } from './AudioVisualizer'
import { useConversation } from '@/hooks/useConversation'

interface ConversationStageProps {
  agentId: string
  onEnd: () => void
}

export const ConversationStage = ({ agentId, onEnd }: ConversationStageProps) => {
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const conversation = useConversation(agentId)

  useEffect(() => {
    const start = async () => {
      try {
        await conversation.startSession()
        setStartTime(new Date())
      } catch (error) {
        console.error('Failed to start conversation:', error)
      }
    }

    if (agentId) {
      start()
    }

    return () => {
      conversation.endSession()
    }
  }, [agentId])

  useEffect(() => {
    if (!startTime) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleEndCall = async () => {
    await conversation.endSession()
    onEnd()
  }

  const isListening = conversation.connectionState === 'connected'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Status Bar */}
        <div className="mb-8 flex items-center justify-between">
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
            Live Interview
          </Badge>
          <Badge variant="outline" className="gap-2">
            <Clock className="h-4 w-4" />
            {formatTime(elapsedTime)}
          </Badge>
        </div>

        {/* Audio Visualizer */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-full bg-purple-600"></div>
            </div>
            <div className="relative z-10">
              <AudioVisualizer isActive={true} isListening={isListening} />
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-8 text-center">
          <div className="inline-block rounded-lg bg-gray-100 px-6 py-3">
            <p className="text-gray-700">
              {conversation.connectionState === 'connecting' && 'Connecting...'}
              {conversation.connectionState === 'connected' && 'Listening...'}
              {conversation.connectionState === 'disconnected' && 'Disconnected'}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={conversation.toggleMute}
            variant={conversation.micMuted ? 'default' : 'outline'}
            className="flex-1"
            size="lg"
          >
            {conversation.micMuted ? (
              <>
                <MicOff className="mr-2 h-5 w-5" />
                Unmute
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" />
                Mute
              </>
            )}
          </Button>
          <Button
            onClick={handleEndCall}
            variant="destructive"
            className="flex-1"
            size="lg"
          >
            <PhoneOff className="mr-2 h-5 w-5" />
            End call
          </Button>
        </div>
      </div>
    </div>
  )
}
