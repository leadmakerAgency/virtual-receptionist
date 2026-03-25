'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ReadyStage } from '@/components/receptionist/ReadyStage'
import { MicrophoneAccessStage } from '@/components/receptionist/MicrophoneAccessStage'
import { AudioConfigStage } from '@/components/receptionist/AudioConfigStage'
import { ConversationStage } from '@/components/receptionist/ConversationStage'
import { Button } from '@/components/ui/button'
import { LogOut, PhoneCall } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type {
  ConversationDynamicVariables,
  ScenarioCategory,
  ScenarioItem,
  ScenarioLevel,
  ScenariosResponse,
  SessionScenarioSnapshot,
} from '@/types/scenario'
import type { PracticeAgent } from '@/types/practiceAgent'

type Stage = 'ready' | 'mic-permission' | 'audio-config' | 'conversation' | 'complete'

interface SessionSummary {
  durationSeconds: number
}

const DEFAULT_LEVEL: ScenarioLevel = 'beginner'

const getFallbackScenario = (
  category: ScenarioCategory | undefined,
  preferredLevel: ScenarioLevel
): ScenarioItem | null => {
  if (!category) return null
  const levelOrder: ScenarioLevel[] = [preferredLevel, 'beginner', 'intermediate', 'advanced']
  for (const level of levelOrder) {
    const candidate = category.levels[level]?.[0]
    if (candidate) return candidate
  }
  return null
}

export default function PracticePage() {
  const router = useRouter()
  const supabase = createClient()

  const [stage, setStage] = useState<Stage>('ready')
  const [agentId, setAgentId] = useState<string | null>(null)
  const [agents, setAgents] = useState<PracticeAgent[]>([])
  const [selectedAgentRecordId, setSelectedAgentRecordId] = useState('')
  const [loadingAgent, setLoadingAgent] = useState(true)
  const [agentError, setAgentError] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [scenariosLoading, setScenariosLoading] = useState(true)
  const [scenariosError, setScenariosError] = useState<string | null>(null)
  const [scenarioCategories, setScenarioCategories] = useState<ScenarioCategory[]>([])
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<ScenarioLevel>(DEFAULT_LEVEL)
  const [selectedScenarioId, setSelectedScenarioId] = useState('')
  const [prospectName, setProspectName] = useState('')
  const [prospectCompanyName, setProspectCompanyName] = useState('')
  const [readyError, setReadyError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email ?? null)
    }
    init()
  }, [supabase])

  // Fetch active scenarios
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const response = await fetch('/api/scenarios', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error ?? 'Failed to load scenarios')
        }

        const data = (await response.json()) as ScenariosResponse
        setScenarioCategories(data.categories)

        const firstCategory = data.categories[0]
        if (firstCategory) {
          const scenario = getFallbackScenario(firstCategory, DEFAULT_LEVEL)
          setSelectedCategoryKey(firstCategory.key)
          setSelectedLevel(scenario?.level ?? DEFAULT_LEVEL)
          setSelectedScenarioId(scenario?.id ?? '')
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load scenarios'
        setScenariosError(msg)
      } finally {
        setScenariosLoading(false)
      }
    }

    fetchScenarios()
  }, [supabase])

  const selectedCategory =
    scenarioCategories.find((category) => category.key === selectedCategoryKey) ?? null
  const selectedScenario =
    selectedCategory?.levels[selectedLevel]?.find((scenario) => scenario.id === selectedScenarioId) ?? null

  const dynamicVariables: ConversationDynamicVariables | null = selectedScenario
    ? {
        prospect_name: prospectName.trim(),
        company_name: prospectCompanyName.trim(),
        scenario_name: selectedScenario.name,
        scenario_category: selectedCategory?.label ?? '',
        scenario_level: selectedScenario.level,
        scenario_brief: selectedScenario.brief,
        scenario_behavior_instructions: selectedScenario.behaviorInstructions,
      }
    : null

  const scenarioSnapshot: SessionScenarioSnapshot | null = useMemo(
    () =>
      selectedScenario && selectedCategory
        ? {
            scenarioId: selectedScenario.id,
            scenarioSlug: selectedScenario.slug,
            scenarioName: selectedScenario.name,
            scenarioLevel: selectedScenario.level,
            scenarioCategoryKey: selectedCategory.key,
            scenarioCategoryLabel: selectedCategory.label,
            scenarioBrief: selectedScenario.brief,
          }
        : null,
    [selectedScenario, selectedCategory]
  )

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const response = await fetch('/api/agents', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error ?? 'Failed to load agents')
        }
        const { agents: list } = (await response.json()) as { agents: PracticeAgent[] }
        setAgents(list)
        const first = list[0]
        if (first?.agent_id) {
          setAgentId(first.agent_id)
          setSelectedAgentRecordId(first.id)
        } else {
          setAgentId(null)
          setSelectedAgentRecordId('')
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load agents'
        setAgentError(msg)
      } finally {
        setLoadingAgent(false)
      }
    }

    fetchAgents()
  }, [supabase])

  const handleAgentSelect = useCallback((recordId: string) => {
    setSelectedAgentRecordId(recordId)
    const row = agents.find((a) => a.id === recordId)
    setAgentId(row?.agent_id ?? null)
    setReadyError(null)
  }, [agents])

  const handleStart = () => {
    if (!prospectName.trim() || !prospectCompanyName.trim()) {
      setReadyError('Prospect name and company are required before starting.')
      return
    }
    if (!selectedScenario) {
      setReadyError('Please choose a valid scenario before starting.')
      return
    }
    if (!agentId || !selectedAgentRecordId) {
      setReadyError('Please select an AI agent before starting.')
      return
    }
    setReadyError(null)
    setStage('mic-permission')
  }

  const handleCategoryChange = useCallback(
    (categoryKey: string) => {
      setSelectedCategoryKey(categoryKey)
      const category = scenarioCategories.find((item) => item.key === categoryKey)
      const nextScenario = getFallbackScenario(category, selectedLevel)
      setSelectedLevel(nextScenario?.level ?? selectedLevel)
      setSelectedScenarioId(nextScenario?.id ?? '')
      setReadyError(null)
    },
    [scenarioCategories, selectedLevel]
  )

  const handleLevelChange = useCallback(
    (level: ScenarioLevel) => {
      setSelectedLevel(level)
      const fallbackScenario = getFallbackScenario(selectedCategory ?? undefined, level)
      setSelectedScenarioId(fallbackScenario?.id ?? '')
      setReadyError(null)
    },
    [selectedCategory]
  )

  const handleMicPermissionGranted = useCallback(() => {
    setStage('audio-config')
  }, [])

  const handleMicPermissionError = useCallback((error: Error) => {
    console.error('Mic permission error:', error)
    setAgentError(
      'Microphone access is required to practice. Please allow microphone permissions and refresh.'
    )
  }, [])

  const handleAudioConfigured = useCallback(async () => {
    // Create the session row before starting the conversation
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          scenario_id: selectedScenario?.id ?? null,
          prospect_name: prospectName.trim(),
          prospect_company_name: prospectCompanyName.trim(),
          scenario_snapshot: scenarioSnapshot,
        }),
      })
      if (response.ok) {
        const { session: coachingSession } = await response.json()
        setCurrentSessionId(coachingSession.id)
      }
    } catch (err) {
      console.error('Failed to create session record:', err)
      // Non-fatal — still proceed to conversation
    }
    setStage('conversation')
  }, [supabase, selectedScenario, prospectName, prospectCompanyName, scenarioSnapshot])

  const handleConversationEnd = useCallback(
    async (durationSeconds: number, conversationId: string | null) => {
      setSessionSummary({ durationSeconds })

      if (currentSessionId) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          await fetch(`/api/sessions/${currentSessionId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              ended_at: new Date().toISOString(),
              duration_seconds: durationSeconds,
              conversation_id: conversationId,
            }),
          })
        } catch (err) {
          console.error('Failed to update session record:', err)
        }
      }

      setStage('complete')
    },
    [currentSessionId, supabase]
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handlePracticeAgain = () => {
    setStage('ready')
    setCurrentSessionId(null)
    setSessionSummary(null)
  }

  if (loadingAgent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-gray-500">Loading practice session…</p>
        </div>
      </div>
    )
  }

  if (agentError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{agentError}</AlertDescription>
          </Alert>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="mt-4"
          >
            Sign out
          </Button>
        </div>
      </div>
    )
  }

  if (stage === 'complete' && sessionSummary) {
    const mins = Math.floor(sessionSummary.durationSeconds / 60)
    const secs = sessionSummary.durationSeconds % 60
    const timeStr =
      mins > 0
        ? `${mins}m ${secs}s`
        : `${secs}s`

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        {/* Header */}
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
          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="text-sm text-gray-500">{userEmail}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-1.5 text-gray-500 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>

        <div className="mt-16 w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <PhoneCall className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Session Complete!
          </h1>
          <p className="mb-2 text-gray-500">
            Great work on your practice session.
          </p>
          <p className="mb-8 text-lg font-semibold text-indigo-600">
            Duration: {timeStr}
          </p>
          <div className="space-y-3">
            <Button
              onClick={handlePracticeAgain}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              size="lg"
            >
              Practice Again
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Persistent header on ready/config stages */}
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
          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="text-sm text-gray-500">{userEmail}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-1.5 text-gray-500 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>
      )}

      <main className={stage === 'ready' || stage === 'audio-config' ? 'pt-14' : ''}>
        {stage === 'ready' && (
          <ReadyStage
            onStart={handleStart}
            prospectName={prospectName}
            prospectCompanyName={prospectCompanyName}
            onProspectNameChange={(value) => {
              setProspectName(value)
              setReadyError(null)
            }}
            onProspectCompanyNameChange={(value) => {
              setProspectCompanyName(value)
              setReadyError(null)
            }}
            agents={agents}
            selectedAgentRecordId={selectedAgentRecordId}
            onAgentChange={handleAgentSelect}
            agentsLoading={loadingAgent}
            categories={scenarioCategories}
            selectedCategoryKey={selectedCategoryKey}
            selectedLevel={selectedLevel}
            selectedScenarioId={selectedScenarioId}
            onCategoryChange={handleCategoryChange}
            onLevelChange={handleLevelChange}
            onScenarioChange={(scenarioId) => {
              setSelectedScenarioId(scenarioId)
              setReadyError(null)
            }}
            scenariosLoading={scenariosLoading}
            scenariosError={scenariosError}
            formError={readyError}
          />
        )}

        {stage === 'mic-permission' && (
          <MicrophoneAccessStage
            onPermissionGranted={handleMicPermissionGranted}
            onError={handleMicPermissionError}
          />
        )}

        {stage === 'audio-config' && (
          <AudioConfigStage onBegin={handleAudioConfigured} />
        )}

        {stage === 'conversation' && agentId && (
          <ConversationStage
            agentId={agentId}
            onEnd={handleConversationEnd}
            prospectName={prospectName.trim() || 'AI Prospect'}
            prospectCompanyName={prospectCompanyName.trim() || 'Company'}
            scenarioName={selectedScenario?.name ?? 'Cold Call Practice Session'}
            dynamicVariables={
              dynamicVariables ?? {
                prospect_name: prospectName.trim() || 'Prospect',
                company_name: prospectCompanyName.trim() || 'Company',
                scenario_name: selectedScenario?.name ?? 'General Scenario',
                scenario_category: selectedCategory?.label ?? 'General',
                scenario_level: selectedLevel,
                scenario_brief: selectedScenario?.brief ?? 'General cold call practice scenario.',
                scenario_behavior_instructions:
                  selectedScenario?.behaviorInstructions ??
                  'Stay realistic, professional, and roleplay a prospect suitable for this scenario.',
              }
            }
          />
        )}
      </main>
    </>
  )
}
