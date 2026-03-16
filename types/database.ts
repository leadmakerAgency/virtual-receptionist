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
