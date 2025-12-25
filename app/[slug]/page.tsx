'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ReadyStage } from '@/components/receptionist/ReadyStage'
import { MicrophoneAccessStage } from '@/components/receptionist/MicrophoneAccessStage'
import { AudioConfigStage } from '@/components/receptionist/AudioConfigStage'
import { ConversationStage } from '@/components/receptionist/ConversationStage'
import { VirtualReceptionist } from '@/types/receptionist'

type Stage = 'ready' | 'microphone' | 'audio-config' | 'conversation'

export default function ReceptionistPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [stage, setStage] = useState<Stage>('ready')
  const [receptionist, setReceptionist] = useState<VirtualReceptionist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [micDeviceId, setMicDeviceId] = useState<string>('')
  const [speakerDeviceId, setSpeakerDeviceId] = useState<string>('')

  useEffect(() => {
    const fetchReceptionist = async () => {
      try {
        const response = await fetch(`/api/receptionists/${slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Receptionist not found')
          } else {
            setError('Failed to load receptionist')
          }
          setLoading(false)
          return
        }

        const data = await response.json()
        setReceptionist(data.receptionist)
      } catch (err) {
        setError('Failed to load receptionist')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchReceptionist()
    }
  }, [slug])

  const handleStart = () => {
    setStage('microphone')
  }

  const handlePermissionGranted = () => {
    setStage('audio-config')
  }

  const handlePermissionError = (error: Error) => {
    console.error('Microphone permission error:', error)
    setError('Microphone access is required to continue. Please allow microphone permissions and refresh the page.')
  }

  const handleAudioConfig = (micId: string, speakerId: string) => {
    setMicDeviceId(micId)
    setSpeakerDeviceId(speakerId)
    setStage('conversation')
  }

  const handleEnd = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !receptionist) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-600">{error || 'Receptionist not found'}</p>
        </div>
      </div>
    )
  }

  if (!receptionist.agent_id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-600">This receptionist is not properly configured.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {stage === 'ready' && <ReadyStage onStart={handleStart} />}
      {stage === 'microphone' && (
        <MicrophoneAccessStage
          onPermissionGranted={handlePermissionGranted}
          onError={handlePermissionError}
        />
      )}
      {stage === 'audio-config' && (
        <AudioConfigStage onBegin={handleAudioConfig} />
      )}
      {stage === 'conversation' && (
        <ConversationStage
          agentId={receptionist.agent_id}
          onEnd={handleEnd}
        />
      )}
    </>
  )
}
