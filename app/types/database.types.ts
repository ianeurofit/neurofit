// Generado desde el esquema de Supabase (tabla profiles + enum user_role).
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.15'
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          role: Database['public']['Enums']['user_role']
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
        }
        Relationships: []
      }
      roadmap_nodes: {
        Row: {
          created_at: string
          event_date: string
          id: string
          items: string[]
          position: number
          status: Database['public']['Enums']['roadmap_status']
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          items?: string[]
          position?: number
          status?: Database['public']['Enums']['roadmap_status']
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          items?: string[]
          position?: number
          status?: Database['public']['Enums']['roadmap_status']
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      roadmap_status: 'done' | 'in_progress' | 'planned'
      user_role: 'superuser' | 'evaluator' | 'user'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
