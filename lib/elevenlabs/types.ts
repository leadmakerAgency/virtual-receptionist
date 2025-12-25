// Internal type for our use - matches SDK structure but more flexible
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
    quality: 'high'  // SDK only accepts 'high' or undefined
    provider: 'elevenlabs'  // SDK only accepts 'elevenlabs' (not 'deepgram')
  }
  tts: {
    model_id: string
    voice_id: string
  }
}

// Internal type for our use (snake_case for database)
export interface CreateAgentRequest {
  name: string
  conversation_config: AgentConfig
}

// Type matching ElevenLabs SDK (camelCase)
export interface ElevenLabsCreateAgentRequest {
  name: string
  conversationConfig: AgentConfig
}

export interface UpdateAgentRequest {
  name?: string
  conversationConfig?: Partial<AgentConfig>
}

export interface Agent {
  agent_id: string
  name: string
  conversation_config: AgentConfig
  created_at: string
  updated_at: string
}
