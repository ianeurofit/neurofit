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
      education_programs: {
        Row: {
          created_at: string
          duration: string
          duration_en: string | null
          icon: string
          id: string
          is_published: boolean
          line: Database['public']['Enums']['education_line']
          objective: string
          objective_en: string | null
          modality: string
          position: number
          slug: string
          title: string
          title_en: string | null
          topics: string[]
          topics_en: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: string
          duration_en?: string | null
          icon?: string
          id?: string
          is_published?: boolean
          line?: Database['public']['Enums']['education_line']
          objective: string
          objective_en?: string | null
          modality?: string
          position?: number
          slug: string
          title: string
          title_en?: string | null
          topics?: string[]
          topics_en?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string
          duration_en?: string | null
          icon?: string
          id?: string
          is_published?: boolean
          line?: Database['public']['Enums']['education_line']
          objective?: string
          objective_en?: string | null
          modality?: string
          position?: number
          slug?: string
          title?: string
          title_en?: string | null
          topics?: string[]
          topics_en?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      roadmap_nodes: {
        Row: {
          created_at: string
          event_date: string
          id: string
          items: Json
          position: number
          status: Database['public']['Enums']['roadmap_status']
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          items?: Json
          position?: number
          status?: Database['public']['Enums']['roadmap_status']
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          items?: Json
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
      education_line: 'talk' | 'workshop' | 'program' | 'ia'
      roadmap_status: 'done' | 'in_progress' | 'planned'
      user_role: 'superuser' | 'evaluator' | 'user'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
