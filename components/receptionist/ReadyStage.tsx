'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, Clock, Check, PhoneCall } from 'lucide-react'
import type { ScenarioLevel } from '@/types/scenario'
import type { PracticeAgent } from '@/types/practiceAgent'

interface ReadyStageProps {
  onStart: () => void
  agent: PracticeAgent
  selectedAgentRecordId: string
  selectedLevel: ScenarioLevel
  onLevelChange: (level: ScenarioLevel) => void
  formError: string | null
}

const LEVEL_OPTIONS: { value: ScenarioLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export const ReadyStage = ({
  onStart,
  agent,
  selectedAgentRecordId,
  selectedLevel,
  onLevelChange,
  formError,
}: ReadyStageProps) => {
  const canStart = Boolean(agent.agent_id) && Boolean(selectedAgentRecordId)

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-b from-purple-50 to-zinc-50 p-4">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Ready to Practice?
        </h1>
        <p className="mb-8 text-gray-600">
          Review your selected agent and choose the difficulty level for this call.
        </p>

        <Card className="mb-6 border-purple-200 bg-purple-600 text-white">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PhoneCall className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-bold">Cold Call Simulation</h2>
                  <p className="text-sm text-purple-100">AI-Powered Practice</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Open-ended</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-lg font-bold">Selected AI Agent</h3>
              <p className="text-purple-100">{agent.name}</p>
              <p className="mt-1 text-sm text-purple-100/90">
                {agent.description || 'No description provided.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid gap-2">
                <Label className="text-white">Level</Label>
                <Select
                  value={selectedLevel}
                  onValueChange={(value) => onLevelChange(value as ScenarioLevel)}
                >
                  <SelectTrigger className="border-purple-300 bg-white text-gray-900">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formError && (
                <p className="text-sm text-red-200">{formError}</p>
              )}
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
          disabled={!canStart}
          className="w-full bg-purple-600 text-white hover:bg-purple-700"
          size="lg"
        >
          <Mic className="mr-2 h-5 w-5" />
          Start Practice Call
        </Button>
      </div>
    </div>
  )
}
