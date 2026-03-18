export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      virtual_receptionists: {
        Row: {
          id: string
          slug: string
          name: string
          agent_id: string | null
          agent_config: Json | null
          first_message: string | null
          prompt: string | null
          voice_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          slug: string
          name: string
          agent_id?: string | null
          agent_config?: Json | null
          first_message?: string | null
          prompt?: string | null
          voice_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          agent_id?: string | null
          agent_config?: Json | null
          first_message?: string | null
          prompt?: string | null
          voice_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'admin' | 'user'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'admin' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'admin' | 'user'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      coaching_sessions: {
        Row: {
          id: string
          user_id: string
          conversation_id: string | null
          scenario_id: string | null
          prospect_name: string | null
          prospect_company_name: string | null
          scenario_snapshot: Json | null
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          conversation_id?: string | null
          scenario_id?: string | null
          prospect_name?: string | null
          prospect_company_name?: string | null
          scenario_snapshot?: Json | null
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          conversation_id?: string | null
          scenario_id?: string | null
          prospect_name?: string | null
          prospect_company_name?: string | null
          scenario_snapshot?: Json | null
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'coaching_sessions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'coaching_sessions_scenario_id_fkey'
            columns: ['scenario_id']
            referencedRelation: 'scenarios'
            referencedColumns: ['id']
          }
        ]
      }
      scenario_categories: {
        Row: {
          id: string
          key: string
          label: string
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          label: string
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          label?: string
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          id: string
          category_id: string
          slug: string
          name: string
          level: 'beginner' | 'intermediate' | 'advanced'
          brief: string
          behavior_instructions: string
          first_message_template: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          slug: string
          name: string
          level: 'beginner' | 'intermediate' | 'advanced'
          brief: string
          behavior_instructions: string
          first_message_template?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          slug?: string
          name?: string
          level?: 'beginner' | 'intermediate' | 'advanced'
          brief?: string
          behavior_instructions?: string
          first_message_template?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'scenarios_category_id_fkey'
            columns: ['category_id']
            referencedRelation: 'scenario_categories'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
