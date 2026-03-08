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
      admin_advice: {
        Row: {
          content: string
          created_at: string | null
          id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      admin_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_global: boolean | null
          is_read: boolean | null
          target_user_id: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          is_read?: boolean | null
          target_user_id?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          is_read?: boolean | null
          target_user_id?: string | null
          title?: string
        }
        Relationships: []
      }
      course_categories: {
        Row: {
          created_at: string | null
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      course_videos: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          sort_order: number
          title: string
          youtube_url: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          sort_order?: number
          title: string
          youtube_url: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          sort_order?: number
          title?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_rewards: {
        Row: {
          claimed: boolean | null
          created_at: string | null
          id: string
          reward_date: string | null
          reward_type: string | null
          user_id: string
        }
        Insert: {
          claimed?: boolean | null
          created_at?: string | null
          id?: string
          reward_date?: string | null
          reward_type?: string | null
          user_id: string
        }
        Update: {
          claimed?: boolean | null
          created_at?: string | null
          id?: string
          reward_date?: string | null
          reward_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          deposit_date: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          deposit_date?: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deposit_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      emotional_checkins: {
        Row: {
          created_at: string
          emotional_state: string
          had_argument: boolean
          id: string
          is_risky: boolean
          proceeded: boolean
          recovering_loss: boolean
          slept_well: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          emotional_state?: string
          had_argument?: boolean
          id?: string
          is_risky?: boolean
          proceeded?: boolean
          recovering_loss?: boolean
          slept_well?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          emotional_state?: string
          had_argument?: boolean
          id?: string
          is_risky?: boolean
          proceeded?: boolean
          recovering_loss?: boolean
          slept_well?: boolean
          user_id?: string
        }
        Relationships: []
      }
      horus_analyses: {
        Row: {
          analysis_type: string
          created_at: string
          id: string
          prompt_used: string | null
          response: string | null
          tone: string
          user_id: string
        }
        Insert: {
          analysis_type?: string
          created_at?: string
          id?: string
          prompt_used?: string | null
          response?: string | null
          tone?: string
          user_id: string
        }
        Update: {
          analysis_type?: string
          created_at?: string
          id?: string
          prompt_used?: string | null
          response?: string | null
          tone?: string
          user_id?: string
        }
        Relationships: []
      }
      horus_print_analyses: {
        Row: {
          confidence: number | null
          created_at: string
          entry_time: string | null
          exit_time: string | null
          id: string
          image_url: string | null
          raw_response: string | null
          scenario: string | null
          timeframe: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          entry_time?: string | null
          exit_time?: string | null
          id?: string
          image_url?: string | null
          raw_response?: string | null
          scenario?: string | null
          timeframe?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          entry_time?: string | null
          exit_time?: string | null
          id?: string
          image_url?: string | null
          raw_response?: string | null
          scenario?: string | null
          timeframe?: string
          user_id?: string
        }
        Relationships: []
      }
      horus_prompts: {
        Row: {
          id: string
          prompt_key: string
          prompt_label: string
          prompt_value: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_key: string
          prompt_label: string
          prompt_value?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt_key?: string
          prompt_label?: string
          prompt_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      horus_settings: {
        Row: {
          id: string
          setting_key: string
          setting_type: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_type?: string
          setting_value?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_scores: {
        Row: {
          day_of_week: number
          id: string
          losses: number
          updated_at: string
          week_start: string
          wins: number
        }
        Insert: {
          day_of_week: number
          id?: string
          losses?: number
          updated_at?: string
          week_start?: string
          wins?: number
        }
        Update: {
          day_of_week?: number
          id?: string
          losses?: number
          updated_at?: string
          week_start?: string
          wins?: number
        }
        Relationships: []
      }
      monthly_scores: {
        Row: {
          created_at: string
          id: string
          losses: number
          month_start: string
          updated_at: string
          wins: number
        }
        Insert: {
          created_at?: string
          id?: string
          losses?: number
          month_start: string
          updated_at?: string
          wins?: number
        }
        Update: {
          created_at?: string
          id?: string
          losses?: number
          month_start?: string
          updated_at?: string
          wins?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_management_mode: string | null
          balance: number | null
          consecutive_losses: number | null
          created_at: string | null
          discipline_score: number | null
          display_name: string | null
          entry_percentage: number | null
          forced_pause_until: string | null
          id: string
          is_super_vip: boolean
          is_vip: boolean
          last_login_date: string | null
          soros_enabled: boolean | null
          soros_level: number | null
          stop_daily: number | null
          stop_loss: number | null
          stop_weekly: number | null
          stop_win: number | null
          streak_days: number | null
          super_vip_expires_at: string | null
          total_profit: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_management_mode?: string | null
          balance?: number | null
          consecutive_losses?: number | null
          created_at?: string | null
          discipline_score?: number | null
          display_name?: string | null
          entry_percentage?: number | null
          forced_pause_until?: string | null
          id?: string
          is_super_vip?: boolean
          is_vip?: boolean
          last_login_date?: string | null
          soros_enabled?: boolean | null
          soros_level?: number | null
          stop_daily?: number | null
          stop_loss?: number | null
          stop_weekly?: number | null
          stop_win?: number | null
          streak_days?: number | null
          super_vip_expires_at?: string | null
          total_profit?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_management_mode?: string | null
          balance?: number | null
          consecutive_losses?: number | null
          created_at?: string | null
          discipline_score?: number | null
          display_name?: string | null
          entry_percentage?: number | null
          forced_pause_until?: string | null
          id?: string
          is_super_vip?: boolean
          is_vip?: boolean
          last_login_date?: string | null
          soros_enabled?: boolean | null
          soros_level?: number | null
          stop_daily?: number | null
          stop_loss?: number | null
          stop_weekly?: number | null
          stop_win?: number | null
          streak_days?: number | null
          super_vip_expires_at?: string | null
          total_profit?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      psychology_content: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          created_at: string
          id: string
          maior_streak: number
          streak_atual: number
          streak_freeze_disponivel: number
          total_freezes: number
          ultimo_dia_ativo: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          maior_streak?: number
          streak_atual?: number
          streak_freeze_disponivel?: number
          total_freezes?: number
          ultimo_dia_ativo?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          maior_streak?: number
          streak_atual?: number
          streak_freeze_disponivel?: number
          total_freezes?: number
          ultimo_dia_ativo?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      super_vip_subscriptions: {
        Row: {
          activated_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          payment_id: string | null
          payment_method: string | null
          plan_name: string
          price: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          plan_name?: string
          price?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          plan_name?: string
          price?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trader_diary: {
        Row: {
          created_at: string
          emotional_state: string | null
          entry_date: string
          followed_plan: boolean | null
          id: string
          lessons: string | null
          mistakes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emotional_state?: string | null
          entry_date?: string
          followed_plan?: boolean | null
          id?: string
          lessons?: string | null
          mistakes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          emotional_state?: string | null
          entry_date?: string
          followed_plan?: boolean | null
          id?: string
          lessons?: string | null
          mistakes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          amount: number | null
          created_at: string | null
          entry_type: string | null
          followed_plan: boolean | null
          id: string
          management_mode: string | null
          observation: string | null
          pair_name: string
          payout: number
          profit: number | null
          result: string
          soros_level: number | null
          trade_date: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          entry_type?: string | null
          followed_plan?: boolean | null
          id?: string
          management_mode?: string | null
          observation?: string | null
          pair_name: string
          payout: number
          profit?: number | null
          result: string
          soros_level?: number | null
          trade_date?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          entry_type?: string | null
          followed_plan?: boolean | null
          id?: string
          management_mode?: string | null
          observation?: string | null
          pair_name?: string
          payout?: number
          profit?: number | null
          result?: string
          soros_level?: number | null
          trade_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          created_at: string | null
          id: string
          title: string
          youtube_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
          youtube_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          youtube_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      profit_rankings: {
        Row: {
          display_name: string | null
          losses: number | null
          management_mode: string | null
          total_profit: number | null
          total_trades: number | null
          user_id: string | null
          wins: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reset_weekly_scores: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
