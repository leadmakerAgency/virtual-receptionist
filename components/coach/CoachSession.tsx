'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useConversation } from '@elevenlabs/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mic, PhoneOff } from 'lucide-react'

type CoachSessionProps = {
  slug: string
  agentDisplayName: string
  description: string
}

const formatErrorFromResponse = async (res: Response, fallback: string) => {
  try {
    const data = (await res.json()) as { error?: unknown }
    if (typeof data.error === 'string' && data.error.trim()) return data.error
  } catch {
    /* ignore */
  }
  return fallback
}

export const CoachSession = ({ slug, agentDisplayName, description }: CoachSessionProps) => {
  const [micReady, setMicReady] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  const conversation = useConversation({
    onError: (message) => {
      const text =
        typeof message === 'string'
          ? message
          : message && typeof message === 'object' && 'message' in message
            ? String((message as { message?: unknown }).message ?? 'Voice session error')
            : 'Voice session error'
      setLocalError(text)
    },
    onDisconnect: () => {
      setStarting(false)
    },
  })

  const handleEnableMicrophone = async () => {
    setLocalError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      setMicReady(true)
    } catch {
      setLocalError(
        'Microphone access is required to practice. Please allow microphone access in your browser and try again.'
      )
    }
  }

  const handleStartCall = async () => {
    setLocalError(null)
    setStarting(true)
    try {
      const res = await fetch(`/api/public/coach/${encodeURIComponent(slug)}/signed-url`)
      if (!res.ok) {
        setLocalError(await formatErrorFromResponse(res, 'Could not start session.'))
        setStarting(false)
        return
      }
      const payload = (await res.json()) as { signedUrl?: string }
      if (!payload.signedUrl?.trim()) {
        setLocalError('Could not start session.')
        setStarting(false)
        return
      }

      await conversation.startSession({
        signedUrl: payload.signedUrl.trim(),
        connectionType: 'websocket',
      })
      setStarting(false)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to start call.')
      setStarting(false)
    }
  }

  const handleEndCall = async () => {
    setLocalError(null)
    try {
      await conversation.endSession()
    } finally {
      setStarting(false)
    }
  }

  const status = conversation.status
  const isConnected = status === 'connected'

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4">
          <Image
            src="https://cdn.prod.website-files.com/635b136ad9dc07c8ea095fdb/6734c390a167ec14434b314a_LeadMaker%20Vector%20Logo-01%20-%20Copy-p-500.png"
            alt="LeadMaker"
            width={160}
            height={160}
            className="h-16 w-auto object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Cold Call Coach</h1>
        <p className="mt-1 text-sm text-gray-500">Practice your pitch. Close more deals.</p>
      </div>

      <section
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        aria-labelledby="coach-agent-heading"
      >
        <h2 id="coach-agent-heading" className="text-lg font-semibold text-gray-900">
          {agentDisplayName}
        </h2>
        {description.trim() ? (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        ) : null}

        <p className="mt-4 text-xs text-gray-400" aria-live="polite">
          Status: {status}
        </p>

        <div className="mt-6 space-y-4" role="region" aria-label="Voice practice controls">
          {localError && (
            <Alert className="border-red-200 bg-red-50" aria-live="assertive">
              <AlertDescription className="text-sm text-red-800">{localError}</AlertDescription>
            </Alert>
          )}

          {!micReady && !isConnected ? (
            <Button
              type="button"
              className="h-11 w-full bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={handleEnableMicrophone}
            >
              <Mic className="mr-2 size-4 shrink-0" aria-hidden />
              Enable microphone
            </Button>
          ) : null}

          {micReady && !isConnected ? (
            <Button
              type="button"
              className="h-11 w-full bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={handleStartCall}
              disabled={starting}
            >
              {starting ? (
                <>
                  <Loader2 className="mr-2 size-4 shrink-0 animate-spin" aria-hidden />
                  Connecting…
                </>
              ) : (
                'Start practice call'
              )}
            </Button>
          ) : null}

          {isConnected ? (
            <Button
              type="button"
              variant="destructive"
              className="h-11 w-full"
              onClick={handleEndCall}
            >
              <PhoneOff className="mr-2 size-4 shrink-0" aria-hidden />
              End call
            </Button>
          ) : null}
        </div>
      </section>
    </main>
  )
}
