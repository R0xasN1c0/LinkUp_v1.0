export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      availability: {
        Row: {
          created_at: string | null
          event_id: number | null
          id: number
          is_available: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: number | null
          id?: never
          is_available?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: number | null
          id?: never
          is_available?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "group_events"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_connections: {
        Row: {
          access_token: string
          calendar_name: string | null
          created_at: string | null
          external_calendar_id: string
          id: string
          last_synced_at: string | null
          provider: string
          refresh_token: string
          sync_token: string | null
          token_expires_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_name?: string | null
          created_at?: string | null
          external_calendar_id: string
          id?: string
          last_synced_at?: string | null
          provider: string
          refresh_token: string
          sync_token?: string | null
          token_expires_at: string
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_name?: string | null
          created_at?: string | null
          external_calendar_id?: string
          id?: string
          last_synced_at?: string | null
          provider?: string
          refresh_token?: string
          sync_token?: string | null
          token_expires_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendars: {
        Row: {
          calendar_name: string | null
          created_at: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          calendar_name?: string | null
          created_at?: string | null
          id?: never
          user_id?: string | null
        }
        Update: {
          calendar_name?: string | null
          created_at?: string | null
          id?: never
          user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          is_private: boolean | null
          location: string | null
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_private?: boolean | null
          location?: string | null
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_private?: boolean | null
          location?: string | null
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      group_calendars: {
        Row: {
          created_at: string | null
          group_id: number | null
          id: number
        }
        Insert: {
          created_at?: string | null
          group_id?: number | null
          id?: never
        }
        Update: {
          created_at?: string | null
          group_id?: number | null
          id?: never
        }
        Relationships: []
      }
      group_events: {
        Row: {
          created_at: string | null
          end_time: string | null
          event_name: string | null
          group_calendar_id: number | null
          id: number
          location: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          event_name?: string | null
          group_calendar_id?: number | null
          id?: never
          location?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          event_name?: string | null
          group_calendar_id?: number | null
          id?: never
          location?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_events_group_calendar_id_fkey"
            columns: ["group_calendar_id"]
            isOneToOne: false
            referencedRelation: "group_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          is_admin: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          is_admin?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          is_admin?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          name: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          username?: string | null
        }
        Relationships: []
      }
      vote_responses: {
        Row: {
          created_at: string | null
          id: string
          response: string
          user_id: string
          vote_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          response: string
          user_id: string
          vote_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          response?: string
          user_id?: string
          vote_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          group_id: string
          id: string
          proposed_end: string
          proposed_start: string
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          group_id: string
          id?: string
          proposed_end: string
          proposed_start: string
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          group_id?: string
          id?: string
          proposed_end?: string
          proposed_start?: string
          status?: string | null
          title?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
