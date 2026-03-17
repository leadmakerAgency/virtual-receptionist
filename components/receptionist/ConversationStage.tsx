'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, PhoneOff, Clock, Phone } from 'lucide-react'
import { useConversation } from '@/hooks/useConversation'

interface ConversationStageProps {
  agentId: string
  onEnd: (durationSeconds: number) => void
}

const PulseRings = ({ active }: { active: boolean }) => (
  <div className="absolute inset-0 flex items-center justify-center">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className={`absolute rounded-full border transition-all duration-1000 ${
          active
            ? 'border-emerald-400/30 animate-ping'
            : 'border-gray-600/20'
        }`}
        style={{
          width: `${120 + i * 40}px`,
          height: `${120 + i * 40}px`,
          animationDelay: `${i * 400}ms`,
          animationDuration: `${2 + i * 0.5}s`,
        }}
      />
    ))}
  </div>
)

const VoiceWaveform = ({ active }: { active: boolean }) => {
  const bars = 24
  const [heights, setHeights] = useState<number[]>(Array(bars).fill(0.15))
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      setHeights(Array(bars).fill(0.15))
      return
    }

    const animate = () => {
      setHeights((prev) =>
        prev.map((h) => {
          const target = Math.random() * 0.85 + 0.15
          return h + (target - h) * 0.3
        })
      )
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [active])

  return (
    <div className="flex h-10 items-end justify-center gap-[3px]">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full transition-all duration-100"
          style={{
            height: `${h * 40}px`,
            backgroundColor: active
              ? `rgba(52, 211, 153, ${0.5 + h * 0.5})`
              : 'rgba(107, 114, 128, 0.3)',
          }}
        />
      ))}
    </div>
  )
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
    onEnd(elapsedTime)
  }

  const isConnected = conversation.connectionState === 'connected'
  const isConnecting = conversation.connectionState === 'connecting'

  const statusText = isConnecting
    ? 'Connecting...'
    : isConnected
      ? 'Connected'
      : 'Disconnected'

  const statusColor = isConnected
    ? 'text-emerald-400'
    : isConnecting
      ? 'text-amber-400'
      : 'text-gray-400'

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'}`} />
          <span className={`text-sm font-medium ${statusColor}`}>
            {statusText}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <Clock className="h-4 w-4" />
          <span className="font-mono text-sm tabular-nums">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {/* Avatar + pulse */}
        <div className="relative mb-8 flex items-center justify-center" style={{ width: '280px', height: '280px' }}>
          <PulseRings active={isConnected} />
          <div className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full transition-all duration-500 ${
            isConnected
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25'
              : isConnecting
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25'
                : 'bg-gray-700'
          }`}>
            <Phone className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Caller info */}
        <h2 className="mb-1 text-xl font-semibold text-white">AI Prospect</h2>
        <p className="mb-6 text-sm text-gray-400">Cold Call Practice Session</p>

        {/* Waveform */}
        <div className="mb-10 w-full max-w-xs">
          <VoiceWaveform active={isConnected && !conversation.micMuted} />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-10 pt-4">
        <div className="mx-auto flex max-w-sm items-center justify-center gap-6">
          {/* Mute */}
          <button
            type="button"
            onClick={conversation.toggleMute}
            aria-label={conversation.micMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-all ${
              conversation.micMuted
                ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {conversation.micMuted ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </button>

          {/* End call */}
          <Button
            onClick={handleEndCall}
            aria-label="End call"
            className="h-16 w-16 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700"
          >
            <PhoneOff className="h-7 w-7" />
          </Button>

          {/* Spacer for visual balance */}
          <div className="h-14 w-14" />
        </div>

        {conversation.micMuted && (
          <p className="mt-4 text-center text-sm text-red-400/80">Microphone muted</p>
        )}
      </div>
    </div>
  )
}
