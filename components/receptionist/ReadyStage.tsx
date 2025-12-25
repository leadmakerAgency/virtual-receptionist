'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, Clock, Check } from 'lucide-react'
import Link from 'next/link'

interface ReadyStageProps {
  onStart: () => void
}

export const ReadyStage = ({ onStart }: ReadyStageProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Ready to Begin Your Interview?
        </h1>
        <p className="mb-8 text-gray-600">
          Complete your voice interview with our AI recruiter
        </p>

        <Card className="mb-6 bg-purple-600 text-white">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mic className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-bold">Voice Interview</h2>
                  <p className="text-sm text-purple-100">AI-Powered</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">10-15 min</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-lg font-bold">What to Expect</h3>
              <p className="text-purple-50">
                You'll have a natural conversation with our AI recruitment assistant.
                They'll ask about your background, career goals, and what motivates you.
                Just be yourself and speak naturally.
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
            </div>
          </CardContent>
        </Card>

        <p className="mb-6 text-center text-sm text-gray-600">
          By clicking "Start Interview", I agree to the{' '}
          <Link href="/terms" className="underline hover:text-gray-900">
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-gray-900">
            Privacy Policy
          </Link>
          .
        </p>

        <Button
          onClick={onStart}
          className="w-full bg-purple-600 text-white hover:bg-purple-700"
          size="lg"
        >
          <Mic className="mr-2 h-5 w-5" />
          Start Interview
        </Button>
      </div>
    </div>
  )
}
