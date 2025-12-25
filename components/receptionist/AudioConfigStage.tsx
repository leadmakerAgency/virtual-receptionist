'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mic, Volume2, Check } from 'lucide-react'
import { useAudioDevices } from '@/hooks/useAudioDevices'

interface AudioConfigStageProps {
  onBegin: (micDeviceId: string, speakerDeviceId: string) => void
}

export const AudioConfigStage = ({ onBegin }: AudioConfigStageProps) => {
  const { microphones, speakers, loading } = useAudioDevices()
  const [selectedMic, setSelectedMic] = useState<string>('')
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('')

  useEffect(() => {
    if (microphones.length > 0 && !selectedMic) {
      setSelectedMic(microphones[0].deviceId)
    }
    if (speakers.length > 0 && !selectedSpeaker) {
      setSelectedSpeaker(speakers[0].deviceId)
    }
  }, [microphones, speakers, selectedMic, selectedSpeaker])

  const handleBegin = () => {
    if (selectedMic && selectedSpeaker) {
      // Store in localStorage for later use
      localStorage.setItem('selectedMic', selectedMic)
      localStorage.setItem('selectedSpeaker', selectedSpeaker)
      onBegin(selectedMic, selectedSpeaker)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Configure Your Audio
          </h1>
          <p className="mb-6 text-gray-600">
            Select your microphone and speaker for the best experience
          </p>

          <Alert className="mb-6 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Microphone Access Granted</strong>
              <br />
              <span className="text-sm text-green-700">
                Your audio devices are ready to use
              </span>
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Mic className="h-5 w-5 text-purple-600" />
                <label className="text-sm font-medium text-gray-700">
                  Microphone
                </label>
              </div>
              <Select
                value={selectedMic}
                onValueChange={setSelectedMic}
                disabled={loading || microphones.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {microphones.map((mic) => (
                    <SelectItem key={mic.deviceId} value={mic.deviceId}>
                      {mic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-purple-600" />
                <label className="text-sm font-medium text-gray-700">
                  Speaker
                </label>
              </div>
              <Select
                value={selectedSpeaker}
                onValueChange={setSelectedSpeaker}
                disabled={loading || speakers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  {speakers.map((speaker) => (
                    <SelectItem key={speaker.deviceId} value={speaker.deviceId}>
                      {speaker.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleBegin}
              disabled={!selectedMic || !selectedSpeaker || loading}
              className="w-full bg-purple-600 text-white hover:bg-purple-700"
              size="lg"
            >
              Let's Begin!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
