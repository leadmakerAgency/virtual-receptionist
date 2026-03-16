'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, Clock, Check, PhoneCall } from 'lucide-react'

interface ReadyStageProps {
  onStart: () => void
}

export const ReadyStage = ({ onStart }: ReadyStageProps) => {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Ready to Practice?
        </h1>
        <p className="mb-8 text-gray-600">
          You'll speak with an AI prospect who plays a resistant real estate business owner. Practice your cold call script and handle objections.
        </p>

        <Card className="mb-6 bg-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PhoneCall className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-bold">Cold Call Simulation</h2>
                  <p className="text-sm text-indigo-200">AI-Powered Practice</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Open-ended</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-lg font-bold">The Scenario</h3>
              <p className="text-indigo-100">
                You're calling a brand-new real estate company that registered today. The owner will be on guard — they weren't expecting your call. Your goal is to introduce commercial insurance, handle resistance, and build enough rapport to get them interested.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-300" />
                <span>Find a quiet space with minimal background noise</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-300" />
                <span>Ensure your microphone is working properly</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-300" />
                <span>Have a stable internet connection</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-300" />
                <span>End the call when you feel the conversation is complete</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={onStart}
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          size="lg"
        >
          <Mic className="mr-2 h-5 w-5" />
          Start Practice Call
        </Button>
      </div>
    </div>
  )
}
