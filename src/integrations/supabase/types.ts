export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      commissions: {
        Row: {
          admin_id: string
          commission_double: number | null
          commission_quad: number | null
          commission_quint: number | null
          commission_triple: number | null
          created_at: string
          id: string
          request_id: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          commission_double?: number | null
          commission_quad?: number | null
          commission_quint?: number | null
          commission_triple?: number | null
          created_at?: string
          id?: string
          request_id: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          commission_double?: number | null
          commission_quad?: number | null
          commission_quint?: number | null
          commission_triple?: number | null
          created_at?: string
          id?: string
          request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          address: string | null
          city: Database["public"]["Enums"]["city_type"]
          created_at: string
          description: string | null
          distance_to_haram: number | null
          facilities: string | null
          id: string
          name: string
          rating: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city: Database["public"]["Enums"]["city_type"]
          created_at?: string
          description?: string | null
          distance_to_haram?: number | null
          facilities?: string | null
          id?: string
          name: string
          rating?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: Database["public"]["Enums"]["city_type"]
          created_at?: string
          description?: string | null
          distance_to_haram?: number | null
          facilities?: string | null
          id?: string
          name?: string
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      offerings: {
        Row: {
          admin_margin: number | null
          created_at: string
          final_price_double: number | null
          final_price_quad: number | null
          final_price_quint: number | null
          final_price_triple: number | null
          hotel_id: string
          hotel_name: string
          id: string
          price_double: number | null
          price_quad: number | null
          price_quint: number | null
          price_triple: number | null
          provider_user_id: string
          request_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_margin?: number | null
          created_at?: string
          final_price_double?: number | null
          final_price_quad?: number | null
          final_price_quint?: number | null
          final_price_triple?: number | null
          hotel_id: string
          hotel_name: string
          id?: string
          price_double?: number | null
          price_quad?: number | null
          price_quint?: number | null
          price_triple?: number | null
          provider_user_id: string
          request_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_margin?: number | null
          created_at?: string
          final_price_double?: number | null
          final_price_quad?: number | null
          final_price_quint?: number | null
          final_price_triple?: number | null
          hotel_id?: string
          hotel_name?: string
          id?: string
          price_double?: number | null
          price_quad?: number | null
          price_quint?: number | null
          price_triple?: number | null
          provider_user_id?: string
          request_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offerings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offerings_provider_user_id_fkey"
            columns: ["provider_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offerings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          bidding_deadline: string
          check_in_date: string
          check_out_date: string
          city: Database["public"]["Enums"]["city_type"]
          created_at: string
          id: string
          package_type: Database["public"]["Enums"]["package_type"]
          pax: number
          request_number: number
          room_double: number
          room_quad: number
          room_quint: number
          room_triple: number
          status: Database["public"]["Enums"]["request_status"]
          tour_leader: string
          travel_name: string
          travel_workspace_id: string
          updated_at: string
        }
        Insert: {
          bidding_deadline: string
          check_in_date: string
          check_out_date: string
          city: Database["public"]["Enums"]["city_type"]
          created_at?: string
          id?: string
          package_type: Database["public"]["Enums"]["package_type"]
          pax: number
          request_number?: number
          room_double?: number
          room_quad?: number
          room_quint?: number
          room_triple?: number
          status?: Database["public"]["Enums"]["request_status"]
          tour_leader: string
          travel_name: string
          travel_workspace_id: string
          updated_at?: string
        }
        Update: {
          bidding_deadline?: string
          check_in_date?: string
          check_out_date?: string
          city?: Database["public"]["Enums"]["city_type"]
          created_at?: string
          id?: string
          package_type?: Database["public"]["Enums"]["package_type"]
          pax?: number
          request_number?: number
          room_double?: number
          room_quad?: number
          room_quint?: number
          room_triple?: number
          status?: Database["public"]["Enums"]["request_status"]
          tour_leader?: string
          travel_name?: string
          travel_workspace_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_travel_workspace_id_fkey"
            columns: ["travel_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          key: string
          updated_at: string
          value: string
          value_type: Database["public"]["Enums"]["value_type"]
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          updated_at?: string
          value: string
          value_type: Database["public"]["Enums"]["value_type"]
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          updated_at?: string
          value?: string
          value_type?: Database["public"]["Enums"]["value_type"]
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      city_type: "Makkah" | "Madinah"
      package_type: "PROMO" | "VIP" | "REGULAR"
      request_status: "Submitted" | "Quoted" | "Confirmed"
      user_role: "travel_agent" | "hotel_provider" | "admin" | "super_admin"
      value_type: "decimal" | "integer" | "string" | "boolean" | "json"
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
      city_type: ["Makkah", "Madinah"],
      package_type: ["PROMO", "VIP", "REGULAR"],
      request_status: ["Submitted", "Quoted", "Confirmed"],
      user_role: ["travel_agent", "hotel_provider", "admin", "super_admin"],
      value_type: ["decimal", "integer", "string", "boolean", "json"],
    },
  },
} as const
