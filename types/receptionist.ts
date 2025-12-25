import { Database } from './database'

export type VirtualReceptionist = Database['public']['Tables']['virtual_receptionists']['Row']

export interface ReceptionistFormData {
  slug: string
  name: string
  prompt: string
  first_message: string
  voice_id: string
}
