'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ReadyStage } from '@/components/receptionist/ReadyStage'
import { MicrophoneAccessStage } from '@/components/receptionist/MicrophoneAccessStage'
import { AudioConfigStage } from '@/components/receptionist/AudioConfigStage'
import { ConversationStage } from '@/components/receptionist/ConversationStage'
import { Button } from '@/components/ui/button'
import { PhoneCall } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { PracticeAgent } from '@/types/practiceAgent'

type Stage = 'ready' | 'mic-permission' | 'audio-config' | 'conversation' | 'complete'

interface SessionSummary {
  durationSeconds: number
}

type CoachPracticeFlowProps = {
  publicCoachId: string
  agent: PracticeAgent
}

export const CoachPracticeFlow = ({ publicCoachId, agent }: CoachPracticeFlowProps) => {
  const [stage, setStage] = useState<Stage>('ready')
  const [selectedAgentRecordId] = useState(agent.id)
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null)
  const [readyError, setReadyError] = useState<string | null>(null)
  const [agentError, setAgentError] = useState<string | null>(null)

  const selectedAgent = agent

  const handleStart = () => {
    if (!selectedAgentRecordId || !selectedAgent?.agent_id) {
      setReadyError('This agent is not available for practice right now.')
      return
    }
    setReadyError(null)
    setStage('mic-permission')
  }

  const handleMicPermissionGranted = useCallback(() => {
    setStage('audio-config')
  }, [])

  const handleMicPermissionError = useCallback((error: Error) => {
    console.error('Mic permission error:', error)
    setAgentError(
      'Microphone access is required to practice. Please allow microphone permissions and refresh.'
    )
  }, [])

  const handleAudioConfigured = useCallback(() => {
    setStage('conversation')
  }, [])

  const handleConversationEnd = useCallback((durationSeconds: number, _conversationId: string | null) => {
    setSessionSummary({ durationSeconds })
    setStage('complete')
  }, [])

  const handlePracticeAgain = () => {
    setStage('ready')
    setSessionSummary(null)
    setAgentError(null)
  }

  if (agentError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{agentError}</AlertDescription>
          </Alert>
          <Button type="button" onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Refresh page
          </Button>
        </div>
      </div>
    )
  }

  if (stage === 'complete' && sessionSummary) {
    const mins = Math.floor(sessionSummary.durationSeconds / 60)
    const secs = sessionSummary.durationSeconds % 60
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <header className="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="https://cdn.prod.website-files.com/635b136ad9dc07c8ea095fdb/6734c390a167ec14434b314a_LeadMaker%20Vector%20Logo-01%20-%20Copy-p-500.png"
              alt="LeadMaker logo"
              width={120}
              height={120}
              className="h-10 w-auto object-contain"
            />
            <span className="font-semibold text-gray-900">Cold Call Coach</span>
          </div>
        </header>

        <div className="mt-16 w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <PhoneCall className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Session Complete!</h1>
          <p className="mb-2 text-gray-500">Great work on your practice session.</p>
          <p className="mb-8 text-lg font-semibold text-purple-600">Duration: {timeStr}</p>
          <Button
            type="button"
            onClick={handlePracticeAgain}
            className="w-full bg-purple-600 text-white hover:bg-purple-700"
            size="lg"
          >
            Practice Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {(stage === 'ready' || stage === 'audio-config') && (
        <header className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="https://cdn.prod.website-files.com/635b136ad9dc07c8ea095fdb/6734c390a167ec14434b314a_LeadMaker%20Vector%20Logo-01%20-%20Copy-p-500.png"
              alt="LeadMaker logo"
              width={120}
              height={120}
              className="h-10 w-auto object-contain"
            />
            <span className="font-semibold text-gray-900">Cold Call Coach</span>
          </div>
        </header>
      )}

      <main className={stage === 'ready' || stage === 'audio-config' ? 'pt-14' : ''}>
        {stage === 'ready' && selectedAgent ? (
          <ReadyStage
            onStart={handleStart}
            agent={selectedAgent}
            selectedAgentRecordId={selectedAgentRecordId}
            formError={readyError}
          />
        ) : null}

        {stage === 'mic-permission' && (
          <MicrophoneAccessStage
            onPermissionGranted={handleMicPermissionGranted}
            onError={handleMicPermissionError}
          />
        )}

        {stage === 'audio-config' && <AudioConfigStage onBegin={handleAudioConfigured} />}

        {stage === 'conversation' && publicCoachId ? (
          <ConversationStage publicCoachId={publicCoachId} onEnd={handleConversationEnd} />
        ) : null}
      </main>
    </>
  )
}
