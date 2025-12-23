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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          client_name: string
          client_phone: string
          created_at: string
          date: string
          id: string
          professional_id: string
          salon_id: string
          service_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          time: string
          updated_at: string
        }
        Insert: {
          client_name: string
          client_phone: string
          created_at?: string
          date: string
          id?: string
          professional_id: string
          salon_id: string
          service_id: string
          status?: Database["public"]["Enums"]["appointment_status"]
          time: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          client_phone?: string
          created_at?: string
          date?: string
          id?: string
          professional_id?: string
          salon_id?: string
          service_id?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salon_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          id: string
          last_visit: string | null
          name: string
          phone: string
          salon_id: string
          total_visits: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_visit?: string | null
          name: string
          phone: string
          salon_id: string
          total_visits?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_visit?: string | null
          name?: string
          phone?: string
          salon_id?: string
          total_visits?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salon_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          available_days: number[] | null
          available_hours_end: string | null
          available_hours_start: string | null
          created_at: string
          id: string
          name: string
          photo: string | null
          salon_id: string
          specialty: string | null
          updated_at: string
        }
        Insert: {
          available_days?: number[] | null
          available_hours_end?: string | null
          available_hours_start?: string | null
          created_at?: string
          id?: string
          name: string
          photo?: string | null
          salon_id: string
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          available_days?: number[] | null
          available_hours_end?: string | null
          available_hours_start?: string | null
          created_at?: string
          id?: string
          name?: string
          photo?: string | null
          salon_id?: string
          specialty?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professionals_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salon_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          plan: Database["public"]["Enums"]["user_plan"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          plan?: Database["public"]["Enums"]["user_plan"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          plan?: Database["public"]["Enums"]["user_plan"]
          updated_at?: string
        }
        Relationships: []
      }
      salon_settings: {
        Row: {
          banner_format: Database["public"]["Enums"]["image_format"] | null
          banner_url: string | null
          cover_photo: string | null
          created_at: string
          description: string | null
          id: string
          logo_format: Database["public"]["Enums"]["image_format"] | null
          logo_url: string | null
          name: string
          opening_hours_end: string | null
          opening_hours_start: string | null
          theme_preset: Database["public"]["Enums"]["theme_preset"] | null
          updated_at: string
          user_id: string
          whatsapp: string | null
          working_days: number[] | null
        }
        Insert: {
          banner_format?: Database["public"]["Enums"]["image_format"] | null
          banner_url?: string | null
          cover_photo?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_format?: Database["public"]["Enums"]["image_format"] | null
          logo_url?: string | null
          name?: string
          opening_hours_end?: string | null
          opening_hours_start?: string | null
          theme_preset?: Database["public"]["Enums"]["theme_preset"] | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
          working_days?: number[] | null
        }
        Update: {
          banner_format?: Database["public"]["Enums"]["image_format"] | null
          banner_url?: string | null
          cover_photo?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_format?: Database["public"]["Enums"]["image_format"] | null
          logo_url?: string | null
          name?: string
          opening_hours_end?: string | null
          opening_hours_start?: string | null
          theme_preset?: Database["public"]["Enums"]["theme_preset"] | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
          working_days?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "salon_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          duration: number
          id: string
          name: string
          price: number
          professional_id: string | null
          salon_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          duration?: number
          id?: string
          name: string
          price?: number
          professional_id?: string | null
          salon_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          duration?: number
          id?: string
          name?: string
          price?: number
          professional_id?: string | null
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salon_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      appointment_status: "confirmed" | "cancelled" | "completed"
      image_format: "square" | "rectangular" | "circular"
      subscription_status: "active" | "canceled" | "incomplete" | "past_due"
      theme_preset: "purple" | "rose" | "gold"
      user_plan: "FREE" | "PRO"
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
      appointment_status: ["confirmed", "cancelled", "completed"],
      image_format: ["square", "rectangular", "circular"],
      subscription_status: ["active", "canceled", "incomplete", "past_due"],
      theme_preset: ["purple", "rose", "gold"],
      user_plan: ["FREE", "PRO"],
    },
  },
} as const
