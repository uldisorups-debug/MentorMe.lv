// Rakstīts ar roku, lai atbilstu supabase/migrations/20260826000001_init.sql.
//
// Kad Supabase CLI būs pieslēgts, šo failu var pārģenerēt automātiski:
//   npx supabase login
//   npx supabase gen types typescript --project-id azqbrudrskcyhcbgxihx > src/types/database.ts
//
// Līdz tam: mainot SQL, jāmaina arī šis fails.

export type UserRole  = 'client' | 'coach'
export type PriceTier = 'free' | 'affordable' | 'mid' | 'premium'
export type CertLevel = 'none' | 'acc' | 'pcc' | 'mcc' | 'metacoach' | 'other'

export type BookEntry  = { title: string; author: string; visible: boolean }
export type MovieEntry = { title: string; year: number | null; visible: boolean }
export type MusicEntry = { artist: string; genre: string | null; visible: boolean }

export type Json =
  | string | number | boolean | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          display_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }

      coach_profiles: {
        Row: {
          id: string
          user_id: string
          slug: string
          full_name: string
          tagline: string | null
          bio: string | null
          avatar_url: string | null
          certification: CertLevel | null
          cert_other_label: string | null
          cert_proof_url: string | null
          is_verified: boolean
          years_experience: number | null
          session_languages: string[]
          price_tier: PriceTier
          price_from: number | null
          price_to: number | null
          niches: string[]
          calendly_url: string | null
          books_top: BookEntry[]
          movies_top: MovieEntry[]
          music_top: MusicEntry[]
          gallery_urls: string[]
          is_published: boolean
          profile_views: number
          created_at: string
          updated_at: string
        }
        // slug aizpilda datubāzes trigeris, tāpēc ievietojot to var izlaist.
        // is_verified ievietojot vienmēr tiek piespiests uz false.
        Insert: {
          id?: string
          user_id: string
          slug?: string
          full_name: string
          tagline?: string | null
          bio?: string | null
          avatar_url?: string | null
          certification?: CertLevel | null
          cert_other_label?: string | null
          cert_proof_url?: string | null
          years_experience?: number | null
          session_languages?: string[]
          price_tier?: PriceTier
          price_from?: number | null
          price_to?: number | null
          niches?: string[]
          calendly_url?: string | null
          books_top?: BookEntry[]
          movies_top?: MovieEntry[]
          music_top?: MusicEntry[]
          gallery_urls?: string[]
          is_published?: boolean
        }
        Update: Partial<Omit<Database['public']['Tables']['coach_profiles']['Insert'], 'user_id'>>
        Relationships: [
          {
            foreignKeyName: "coach_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }

      reviews: {
        Row: {
          id: string
          coach_id: string
          client_id: string
          rating: number
          body: string | null
          is_visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          coach_id: string
          client_id: string
          rating: number
          body?: string | null
          is_visible?: boolean
          created_at?: string
        }
        Update: {
          rating?: number
          body?: string | null
          is_visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }

      review_reports: {
        Row: {
          id: string
          review_id: string
          reporter_id: string | null
          reason: string | null
          handled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          reporter_id?: string | null
          reason?: string | null
          handled?: boolean
          created_at?: string
        }
        Update: {
          handled?: boolean
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }

      categories: {
        Row: {
          id: string
          slug: string
          name_lv: string
          name_en: string | null
          name_ru: string | null
          icon: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          slug: string
          name_lv: string
          name_en?: string | null
          name_ru?: string | null
          icon?: string | null
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
        Relationships: []
      }
    }

    Views: {
      coach_ratings: {
        Row: {
          coach_id: string | null
          avg_rating: number | null
          review_count: number | null
        }
        Relationships: []
      }
    }

    Functions: {
      increment_profile_views: {
        Args: { coach_slug: string }
        Returns: undefined
      }
    }

    Enums: {
      user_role: UserRole
      price_tier: PriceTier
      cert_level: CertLevel
    }
  }
}

// Ērtāki aliasi lietošanai komponentēs
export type Profile      = Database['public']['Tables']['profiles']['Row']
export type CoachProfile = Database['public']['Tables']['coach_profiles']['Row']
export type Review       = Database['public']['Tables']['reviews']['Row']
export type Category     = Database['public']['Tables']['categories']['Row']
export type ReviewReport = Database['public']['Tables']['review_reports']['Row']
export type CoachRating  = Database['public']['Views']['coach_ratings']['Row']
