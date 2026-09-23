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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          accent_color: string | null
          card_image_url: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          card_image_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          card_image_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      galpao_photos: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_published: boolean
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_published?: boolean
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      mystery_boxes: {
        Row: {
          collector_name: string | null
          created_at: string
          id: string
          lot_id: string
          number: number
          product_image_url: string | null
          product_name: string | null
          updated_at: string
        }
        Insert: {
          collector_name?: string | null
          created_at?: string
          id?: string
          lot_id: string
          number: number
          product_image_url?: string | null
          product_name?: string | null
          updated_at?: string
        }
        Update: {
          collector_name?: string | null
          created_at?: string
          id?: string
          lot_id?: string
          number?: number
          product_image_url?: string | null
          product_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mystery_boxes_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "mystery_lots"
            referencedColumns: ["id"]
          },
        ]
      }
      mystery_lots: {
        Row: {
          closed_at: string | null
          created_at: string
          id: string
          is_closed: boolean
          name: string
          sold_count: number
          total_boxes: number
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          id?: string
          is_closed?: boolean
          name: string
          sold_count?: number
          total_boxes?: number
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          id?: string
          is_closed?: boolean
          name?: string
          sold_count?: number
          total_boxes?: number
          updated_at?: string
        }
        Relationships: []
      }
      presale_products: {
        Row: {
          brand: string
          brand_id: string | null
          created_at: string
          deposit_price_cents: number
          display_order: number
          eta_date: string | null
          full_price_cents: number
          hover_image_url: string | null
          id: string
          image_url: string
          is_published: boolean
          lot_closes_at: string | null
          lot_code: string | null
          name: string
          ref: string
          specs: string[]
          updated_at: string
        }
        Insert: {
          brand: string
          brand_id?: string | null
          created_at?: string
          deposit_price_cents?: number
          display_order?: number
          eta_date?: string | null
          full_price_cents?: number
          hover_image_url?: string | null
          id?: string
          image_url: string
          is_published?: boolean
          lot_closes_at?: string | null
          lot_code?: string | null
          name: string
          ref: string
          specs?: string[]
          updated_at?: string
        }
        Update: {
          brand?: string
          brand_id?: string | null
          created_at?: string
          deposit_price_cents?: number
          display_order?: number
          eta_date?: string | null
          full_price_cents?: number
          hover_image_url?: string | null
          id?: string
          image_url?: string
          is_published?: boolean
          lot_closes_at?: string | null
          lot_code?: string | null
          name?: string
          ref?: string
          specs?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "presale_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          exibir_preco_publico: boolean
          id: string
          images: string[]
          is_published: boolean
          price_cents: number
          rarity: number | null
          reservation_started_at: string | null
          sale_image_crop: Json | null
          sale_image_original_url: string | null
          sale_image_processed_url: string | null
          series: string | null
          status: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          exibir_preco_publico?: boolean
          id?: string
          images?: string[]
          is_published?: boolean
          price_cents?: number
          rarity?: number | null
          reservation_started_at?: string | null
          sale_image_crop?: Json | null
          sale_image_original_url?: string | null
          sale_image_processed_url?: string | null
          series?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          exibir_preco_publico?: boolean
          id?: string
          images?: string[]
          is_published?: boolean
          price_cents?: number
          rarity?: number | null
          reservation_started_at?: string | null
          sale_image_crop?: Json | null
          sale_image_original_url?: string | null
          sale_image_processed_url?: string | null
          series?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      reservation_collectors: {
        Row: {
          city: string
          created_at: string
          display_name: string
          display_order: number
          id: string
          state: string
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
        }
        Insert: {
          city: string
          created_at?: string
          display_name: string
          display_order?: number
          id?: string
          state: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          display_name?: string
          display_order?: number
          id?: string
          state?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Relationships: []
      }
      reservation_items: {
        Row: {
          collector_id: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          title: string
        }
        Insert: {
          collector_id: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          title: string
        }
        Update: {
          collector_id?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_items_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "reservation_collectors"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "user"
      product_status: "disponivel" | "reservado" | "vendido"
      reservation_status: "na_garagem" | "aguardando_envio"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
      product_status: ["disponivel", "reservado", "vendido"],
      reservation_status: ["na_garagem", "aguardando_envio"],
    },
  },
} as const
