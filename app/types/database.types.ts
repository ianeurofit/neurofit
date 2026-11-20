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
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          diff: Json
          entity: string
          entity_id: string | null
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          diff?: Json
          entity: string
          entity_id?: string | null
          id?: never
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          diff?: Json
          entity?: string
          entity_id?: string | null
          id?: never
        }
        Relationships: []
      }
      evaluator_patients: {
        Row: {
          assigned_by: string | null
          created_at: string
          evaluator_id: string
          patient_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          evaluator_id: string
          patient_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          evaluator_id?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'evaluator_patients_assigned_by_fkey'
            columns: ['assigned_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'evaluator_patients_evaluator_id_fkey'
            columns: ['evaluator_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'evaluator_patients_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
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
      question_options: {
        Row: {
          created_at: string
          id: string
          is_exclusive: boolean
          label: Json
          position: number
          question_id: string
          score: number | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_exclusive?: boolean
          label: Json
          position: number
          question_id: string
          score?: number | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_exclusive?: boolean
          label?: Json
          position?: number
          question_id?: string
          score?: number | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: 'question_options_question_id_fkey'
            columns: ['question_id']
            isOneToOne: false
            referencedRelation: 'questions'
            referencedColumns: ['id']
          },
        ]
      }
      questions: {
        Row: {
          active: boolean
          alert_rule: Json | null
          allows_decline: boolean
          clinical_note: string | null
          code: string
          config: Json
          conversational_hint: Json | null
          created_at: string
          depends_on: Json | null
          direction: Database['public']['Enums']['question_direction']
          doc_ref: string | null
          id: string
          is_draft_content: boolean
          position: number
          prompt: Json
          required: boolean
          section_id: string
          source: string | null
          test_id: string
          type: Database['public']['Enums']['question_type']
          updated_at: string
          variable: string | null
          weight: number | null
        }
        Insert: {
          active?: boolean
          alert_rule?: Json | null
          allows_decline?: boolean
          clinical_note?: string | null
          code: string
          config?: Json
          conversational_hint?: Json | null
          created_at?: string
          depends_on?: Json | null
          direction?: Database['public']['Enums']['question_direction']
          doc_ref?: string | null
          id?: string
          is_draft_content?: boolean
          position: number
          prompt: Json
          required?: boolean
          section_id: string
          source?: string | null
          test_id: string
          type: Database['public']['Enums']['question_type']
          updated_at?: string
          variable?: string | null
          weight?: number | null
        }
        Update: {
          active?: boolean
          alert_rule?: Json | null
          allows_decline?: boolean
          clinical_note?: string | null
          code?: string
          config?: Json
          conversational_hint?: Json | null
          created_at?: string
          depends_on?: Json | null
          direction?: Database['public']['Enums']['question_direction']
          doc_ref?: string | null
          id?: string
          is_draft_content?: boolean
          position?: number
          prompt?: Json
          required?: boolean
          section_id?: string
          source?: string | null
          test_id?: string
          type?: Database['public']['Enums']['question_type']
          updated_at?: string
          variable?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'questions_section_fkey'
            columns: ['section_id', 'test_id']
            isOneToOne: false
            referencedRelation: 'test_sections'
            referencedColumns: ['id', 'test_id']
          },
          {
            foreignKeyName: 'questions_test_id_fkey'
            columns: ['test_id']
            isOneToOne: false
            referencedRelation: 'tests'
            referencedColumns: ['id']
          },
        ]
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
      scale_options: {
        Row: {
          created_at: string
          id: string
          label: Json
          position: number
          scale_code: string
          score: number | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: Json
          position: number
          scale_code: string
          score?: number | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: Json
          position?: number
          scale_code?: string
          score?: number | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: 'scale_options_scale_code_fkey'
            columns: ['scale_code']
            isOneToOne: false
            referencedRelation: 'scales'
            referencedColumns: ['code']
          },
        ]
      }
      scales: {
        Row: {
          code: string
          created_at: string
          name: Json
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          name: Json
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          name?: Json
          updated_at?: string
        }
        Relationships: []
      }
      test_sections: {
        Row: {
          code: string
          created_at: string
          domain: string
          id: string
          is_draft_content: boolean
          position: number
          test_id: string
          title: Json
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          domain: string
          id?: string
          is_draft_content?: boolean
          position: number
          test_id: string
          title: Json
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          domain?: string
          id?: string
          is_draft_content?: boolean
          position?: number
          test_id?: string
          title?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'test_sections_test_id_fkey'
            columns: ['test_id']
            isOneToOne: false
            referencedRelation: 'tests'
            referencedColumns: ['id']
          },
        ]
      }
      tests: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: Json | null
          id: string
          parent_test_id: string | null
          status: Database['public']['Enums']['test_status']
          title: Json
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: Json | null
          id?: string
          parent_test_id?: string | null
          status?: Database['public']['Enums']['test_status']
          title: Json
          updated_at?: string
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: Json | null
          id?: string
          parent_test_id?: string | null
          status?: Database['public']['Enums']['test_status']
          title?: Json
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: 'tests_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tests_parent_test_id_fkey'
            columns: ['parent_test_id']
            isOneToOne: false
            referencedRelation: 'tests'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      questions_public: {
        Row: {
          active: boolean
          allows_decline: boolean
          code: string
          config: Json
          conversational_hint: Json | null
          depends_on: Json | null
          direction: Database['public']['Enums']['question_direction']
          doc_ref: string | null
          id: string
          is_draft_content: boolean
          options: Json
          position: number
          prompt: Json
          required: boolean
          section_id: string
          source: string | null
          test_id: string
          type: Database['public']['Enums']['question_type']
          variable: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      import_test: {
        Args: { test: string, sections: Json, questions: Json }
        Returns: undefined
      }
      create_test_version: {
        Args: { tree: Json }
        Returns: string
      }
      publish_test: {
        Args: { test: string }
        Returns: undefined
      }
      save_question: {
        Args: { test: string, question_id: string | null, question: Json, options: Json }
        Returns: string
      }
      reorder_section_questions: {
        Args: { section: string, question_ids: string[] }
        Returns: undefined
      }
      reorder_test_sections: {
        Args: { test: string, section_ids: string[] }
        Returns: undefined
      }
    }
    Enums: {
      education_line: 'talk' | 'workshop' | 'program' | 'ia'
      question_direction: 'higher_is_risk' | 'higher_is_protective' | 'neutral'
      question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'numeric_scale' | 'agreement' | 'numeric_free' | 'open_text'
      roadmap_status: 'done' | 'in_progress' | 'planned'
      test_status: 'draft' | 'published' | 'archived'
      user_role: 'superuser' | 'evaluator' | 'user'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
