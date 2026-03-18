'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, Clock, Check, PhoneCall } from 'lucide-react'
import type { ScenarioCategory, ScenarioLevel } from '@/types/scenario'

interface ReadyStageProps {
  onStart: () => void
  prospectName: string
  prospectCompanyName: string
  onProspectNameChange: (value: string) => void
  onProspectCompanyNameChange: (value: string) => void
  categories: ScenarioCategory[]
  selectedCategoryKey: string
  selectedLevel: ScenarioLevel
  selectedScenarioId: string
  onCategoryChange: (categoryKey: string) => void
  onLevelChange: (level: ScenarioLevel) => void
  onScenarioChange: (scenarioId: string) => void
  scenariosLoading: boolean
  scenariosError: string | null
  formError: string | null
}

const LEVEL_OPTIONS: { value: ScenarioLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export const ReadyStage = ({
  onStart,
  prospectName,
  prospectCompanyName,
  onProspectNameChange,
  onProspectCompanyNameChange,
  categories,
  selectedCategoryKey,
  selectedLevel,
  selectedScenarioId,
  onCategoryChange,
  onLevelChange,
  onScenarioChange,
  scenariosLoading,
  scenariosError,
  formError,
}: ReadyStageProps) => {
  const selectedCategory = categories.find((category) => category.key === selectedCategoryKey) ?? null
  const levelScenarios = selectedCategory?.levels[selectedLevel] ?? []
  const selectedScenario = levelScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? null
  const canStart =
    !scenariosLoading &&
    !scenariosError &&
    Boolean(prospectName.trim()) &&
    Boolean(prospectCompanyName.trim()) &&
    Boolean(selectedScenarioId)

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Ready to Practice?
        </h1>
        <p className="mb-8 text-gray-600">
          Set the prospect identity, choose your category and level, then start your simulation.
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
              {selectedScenario ? (
                <p className="text-indigo-100">{selectedScenario.brief}</p>
              ) : (
                <p className="text-indigo-100">
                  Choose a category, level, and scenario to configure this call.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="prospect-name" className="text-white">Prospect Name</Label>
                <Input
                  id="prospect-name"
                  value={prospectName}
                  onChange={(event) => onProspectNameChange(event.target.value)}
                  placeholder="e.g. Michael Carter"
                  maxLength={120}
                  className="border-indigo-300 bg-white text-gray-900"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-name" className="text-white">Prospect Company Name</Label>
                <Input
                  id="company-name"
                  value={prospectCompanyName}
                  onChange={(event) => onProspectCompanyNameChange(event.target.value)}
                  placeholder="e.g. Carter Realty Group"
                  maxLength={160}
                  className="border-indigo-300 bg-white text-gray-900"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-white">Category</Label>
                  <Select value={selectedCategoryKey} onValueChange={onCategoryChange} disabled={scenariosLoading}>
                    <SelectTrigger className="border-indigo-300 bg-white text-gray-900">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.key}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-white">Level</Label>
                  <Select
                    value={selectedLevel}
                    onValueChange={(value) => onLevelChange(value as ScenarioLevel)}
                    disabled={scenariosLoading}
                  >
                    <SelectTrigger className="border-indigo-300 bg-white text-gray-900">
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
              </div>
              <div className="grid gap-2">
                <Label className="text-white">Scenario</Label>
                <Select
                  value={selectedScenarioId}
                  onValueChange={onScenarioChange}
                  disabled={scenariosLoading || !selectedCategory || levelScenarios.length === 0}
                >
                  <SelectTrigger className="border-indigo-300 bg-white text-gray-900">
                    <SelectValue placeholder="Select scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelScenarios.map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {scenariosError && (
                <p className="text-sm text-red-200">{scenariosError}</p>
              )}
              {!scenariosError && formError && (
                <p className="text-sm text-red-200">{formError}</p>
              )}
              {!scenariosError && !scenariosLoading && levelScenarios.length === 0 && (
                <p className="text-sm text-amber-100">
                  No active scenarios found for this category and level.
                </p>
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
