export interface AgentConfig {
  agent: {
    language: string
    prompt: {
      prompt: string
      built_in_tools?: string[]
    }
    first_message: string
  }
  asr: {
    quality: 'high' | 'medium' | 'low'
    provider: 'elevenlabs' | 'deepgram'
  }
  tts: {
    model_id: string
    voice_id: string
  }
}

export interface CreateAgentRequest {
  name: string
  conversation_config: AgentConfig
}

export interface UpdateAgentRequest {
  name?: string
  conversation_config?: Partial<AgentConfig>
}

export interface Agent {
  agent_id: string
  name: string
  conversation_config: AgentConfig
  created_at: string
  updated_at: string
}
