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
      users: {
        Row: {
          employee_id: string
          name: string
          created_at: string
        }
        Insert: {
          employee_id: string
          name: string
          created_at?: string
        }
        Update: {
          employee_id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      scenario_attempts: {
        Row: {
          id: string
          employee_id: string
          scenario_id: number
          time_seconds: number
          completed_at: string
          used_hint1: boolean
          used_hint2: boolean
        }
        Insert: {
          id?: string
          employee_id: string
          scenario_id: number
          time_seconds: number
          completed_at?: string
          used_hint1?: boolean
          used_hint2?: boolean
        }
        Update: {
          id?: string
          employee_id?: string
          scenario_id?: number
          time_seconds?: number
          completed_at?: string
          used_hint1?: boolean
          used_hint2?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "scenario_attempts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["employee_id"]
          }
        ]
      }
      user_progress: {
        Row: {
          employee_id: string
          last_three_scenarios: number[]
          updated_at: string
        }
        Insert: {
          employee_id: string
          last_three_scenarios?: number[]
          updated_at?: string
        }
        Update: {
          employee_id?: string
          last_three_scenarios?: number[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["employee_id"]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}