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
      listings: {
        Row: {
          address_address1: string | null
          address_address2: string | null
          address_city: string | null
          address_country: string | null
          address_latitude: string | null
          address_longitude: string | null
          available_date: string | null
          bathrooms: number | null
          bedrooms: number | null
          cats: boolean | null
          default_photo_thumbnail_url: string | null
          deposit: number | null
          dogs: boolean | null
          full_address: string | null
          id: number
          listable_uid: string
          market_rent: number | null
          marketing_title: string | null
          photos: Json | null
          pm_listable_uid: string
          property_management_id: number | null
          square_feet: number | null
        }
        Insert: {
          address_address1?: string | null
          address_address2?: string | null
          address_city?: string | null
          address_country?: string | null
          address_latitude?: string | null
          address_longitude?: string | null
          available_date?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          cats?: boolean | null
          default_photo_thumbnail_url?: string | null
          deposit?: number | null
          dogs?: boolean | null
          full_address?: string | null
          id?: number
          listable_uid: string
          market_rent?: number | null
          marketing_title?: string | null
          photos?: Json | null
          pm_listable_uid: string
          property_management_id?: number | null
          square_feet?: number | null
        }
        Update: {
          address_address1?: string | null
          address_address2?: string | null
          address_city?: string | null
          address_country?: string | null
          address_latitude?: string | null
          address_longitude?: string | null
          available_date?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          cats?: boolean | null
          default_photo_thumbnail_url?: string | null
          deposit?: number | null
          dogs?: boolean | null
          full_address?: string | null
          id?: number
          listable_uid?: string
          market_rent?: number | null
          marketing_title?: string | null
          photos?: Json | null
          pm_listable_uid?: string
          property_management_id?: number | null
          square_feet?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_property_management_id_fkey"
            columns: ["property_management_id"]
            isOneToOne: false
            referencedRelation: "property_managements"
            referencedColumns: ["id"]
          },
        ]
      }
      property_managements: {
        Row: {
          accent_color: string
          accent_color_foreground: string
          created_at: string
          display_name: string
          id: number
          listing_item_url: string
          listings_url: string
          logo_url: string
        }
        Insert: {
          accent_color: string
          accent_color_foreground?: string
          created_at?: string
          display_name: string
          id?: number
          listing_item_url: string
          listings_url: string
          logo_url: string
        }
        Update: {
          accent_color?: string
          accent_color_foreground?: string
          created_at?: string
          display_name?: string
          id?: number
          listing_item_url?: string
          listings_url?: string
          logo_url?: string
        }
        Relationships: []
      }
      "Test table": {
        Row: {
          category: string | null
          created_at: string
          id: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      distinct_cities: {
        Row: {
          address_city: string | null
        }
        Relationships: []
      }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
