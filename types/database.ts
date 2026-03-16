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
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          conversation_id?: string | null
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          conversation_id?: string | null
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
