'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface MicrophoneAccessStageProps {
  onPermissionGranted: () => void
  onError: (error: Error) => void
}

export const MicrophoneAccessStage = ({
  onPermissionGranted,
  onError,
}: MicrophoneAccessStageProps) => {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Stop the stream immediately as we just needed permission
        stream.getTracks().forEach((track) => track.stop())
        onPermissionGranted()
      } catch (err) {
        onError(err as Error)
      }
    }

    requestPermission()
  }, [onPermissionGranted, onError])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Requesting Microphone Access
          </h2>
          <p className="text-gray-600">Please allow microphone permissions.</p>
        </div>
      </div>
    </div>
  )
}
