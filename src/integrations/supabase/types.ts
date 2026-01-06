export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          administrative_position: string
          created_at: string
          department: string
          document_back_url: string | null
          document_front_url: string | null
          document_number: string
          document_type: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          registration_completed: boolean | null
          selfie_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          administrative_position: string
          created_at?: string
          department: string
          document_back_url?: string | null
          document_front_url?: string | null
          document_number: string
          document_type?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          registration_completed?: boolean | null
          selfie_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          administrative_position?: string
          created_at?: string
          department?: string
          document_back_url?: string | null
          document_front_url?: string | null
          document_number?: string
          document_type?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          registration_completed?: boolean | null
          selfie_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      careers: {
        Row: {
          code: string
          created_at: string
          faculty: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          faculty?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          faculty?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      director_profiles: {
        Row: {
          career_id: string | null
          created_at: string
          document_back_url: string | null
          document_front_url: string | null
          document_number: string
          document_type: string
          email: string
          faculty: string | null
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          position: string
          registration_completed: boolean | null
          selfie_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          career_id?: string | null
          created_at?: string
          document_back_url?: string | null
          document_front_url?: string | null
          document_number: string
          document_type?: string
          email: string
          faculty?: string | null
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          position?: string
          registration_completed?: boolean | null
          selfie_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          career_id?: string | null
          created_at?: string
          document_back_url?: string | null
          document_front_url?: string | null
          document_number?: string
          document_type?: string
          email?: string
          faculty?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          position?: string
          registration_completed?: boolean | null
          selfie_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "director_profiles_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          assignment_id: string
          enrolled_at: string
          id: string
          student_id: string
        }
        Insert: {
          assignment_id: string
          enrolled_at?: string
          id?: string
          student_id: string
        }
        Update: {
          assignment_id?: string
          enrolled_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "subject_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          birth_date: string | null
          career_id: string | null
          created_at: string
          document_back_url: string | null
          document_front_url: string | null
          document_number: string
          document_type: string
          email: string
          email_verified: boolean | null
          enrollment_number: string | null
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          phone_verified: boolean | null
          registration_completed: boolean | null
          selfie_url: string | null
          semester: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          career_id?: string | null
          created_at?: string
          document_back_url?: string | null
          document_front_url?: string | null
          document_number: string
          document_type?: string
          email: string
          email_verified?: boolean | null
          enrollment_number?: string | null
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          phone_verified?: boolean | null
          registration_completed?: boolean | null
          selfie_url?: string | null
          semester?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          career_id?: string | null
          created_at?: string
          document_back_url?: string | null
          document_front_url?: string | null
          document_number?: string
          document_type?: string
          email?: string
          email_verified?: boolean | null
          enrollment_number?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          registration_completed?: boolean | null
          selfie_url?: string | null
          semester?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_assignments: {
        Row: {
          academic_year: number
          created_at: string
          id: string
          is_active: boolean | null
          period: string
          subject_id: string
          teacher_id: string
        }
        Insert: {
          academic_year: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          period: string
          subject_id: string
          teacher_id: string
        }
        Update: {
          academic_year?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          period?: string
          subject_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          career_id: string | null
          code: string
          created_at: string
          id: string
          name: string
          semester: number | null
        }
        Insert: {
          career_id?: string | null
          code: string
          created_at?: string
          id?: string
          name: string
          semester?: number | null
        }
        Update: {
          career_id?: string | null
          code?: string
          created_at?: string
          id?: string
          name?: string
          semester?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_evaluations: {
        Row: {
          assignment_id: string
          blockchain_hash: string | null
          evaluated_at: string
          id: string
          responses: Json
          student_id: string
          total_score: number
        }
        Insert: {
          assignment_id: string
          blockchain_hash?: string | null
          evaluated_at?: string
          id?: string
          responses: Json
          student_id: string
          total_score: number
        }
        Update: {
          assignment_id?: string
          blockchain_hash?: string | null
          evaluated_at?: string
          id?: string
          responses?: Json
          student_id?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "teacher_evaluations_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "subject_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          academic_degree: string | null
          created_at: string
          department: string | null
          document_back_url: string | null
          document_front_url: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          registration_completed: boolean | null
          selfie_url: string | null
          specialty: string | null
          user_id: string | null
        }
        Insert: {
          academic_degree?: string | null
          created_at?: string
          department?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          registration_completed?: boolean | null
          selfie_url?: string | null
          specialty?: string | null
          user_id?: string | null
        }
        Update: {
          academic_degree?: string | null
          created_at?: string
          department?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          registration_completed?: boolean | null
          selfie_url?: string | null
          specialty?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "student" | "teacher" | "director"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "student", "teacher", "director"],
    },
  },
} as const
