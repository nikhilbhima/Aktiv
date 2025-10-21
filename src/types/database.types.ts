// =====================================================
// AKTIV DATABASE TYPES
// Auto-generated from Supabase schema
// =====================================================

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
          id: string
          email: string
          full_name: string
          username: string
          bio: string | null
          avatar_url: string | null
          gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
          date_of_birth: string | null
          location_city: string | null
          location_state: string | null
          location_country: string | null
          location_point: unknown | null // PostGIS GEOGRAPHY type
          accountability_mode: boolean
          max_distance_km: number
          preferred_categories: string[] | null
          instagram_handle: string | null
          twitter_handle: string | null
          linkedin_url: string | null
          website_url: string | null
          streak_days: number
          total_goals_completed: number
          total_checkins: number
          created_at: string
          updated_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          username: string
          bio?: string | null
          avatar_url?: string | null
          gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
          date_of_birth?: string | null
          location_city?: string | null
          location_state?: string | null
          location_country?: string | null
          location_point?: unknown | null
          accountability_mode?: boolean
          max_distance_km?: number
          preferred_categories?: string[] | null
          instagram_handle?: string | null
          twitter_handle?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          streak_days?: number
          total_goals_completed?: number
          total_checkins?: number
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          username?: string
          bio?: string | null
          avatar_url?: string | null
          gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
          date_of_birth?: string | null
          location_city?: string | null
          location_state?: string | null
          location_country?: string | null
          location_point?: unknown | null
          accountability_mode?: boolean
          max_distance_km?: number
          preferred_categories?: string[] | null
          instagram_handle?: string | null
          twitter_handle?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          streak_days?: number
          total_goals_completed?: number
          total_checkins?: number
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: GoalCategory
          frequency: GoalFrequency
          frequency_count: number
          start_date: string
          end_date: string | null
          status: GoalStatus
          is_public: boolean
          total_checkins: number
          current_streak: number
          longest_streak: number
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: GoalCategory
          frequency: GoalFrequency
          frequency_count?: number
          start_date?: string
          end_date?: string | null
          status?: GoalStatus
          is_public?: boolean
          total_checkins?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: GoalCategory
          frequency?: GoalFrequency
          frequency_count?: number
          start_date?: string
          end_date?: string | null
          status?: GoalStatus
          is_public?: boolean
          total_checkins?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          status: MatchStatus
          match_score: number | null
          is_irl_match: boolean
          matched_at: string
          accepted_at: string | null
          last_interaction_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          status?: MatchStatus
          match_score?: number | null
          is_irl_match?: boolean
          matched_at?: string
          accepted_at?: string | null
          last_interaction_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          status?: MatchStatus
          match_score?: number | null
          is_irl_match?: boolean
          matched_at?: string
          accepted_at?: string | null
          last_interaction_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          content: string
          is_read: boolean
          read_at: string | null
          sent_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          sender_id: string
          content: string
          is_read?: boolean
          read_at?: string | null
          sent_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          read_at?: string | null
          sent_at?: string
          updated_at?: string
        }
      }
      checkins: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          note: string | null
          proof_url: string | null
          mood: CheckinMood | null
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          user_id: string
          note?: string | null
          proof_url?: string | null
          mood?: CheckinMood | null
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          user_id?: string
          note?: string | null
          proof_url?: string | null
          mood?: CheckinMood | null
          completed_at?: string
          created_at?: string
        }
      }
      irl_activities: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          category: GoalCategory
          location_name: string
          location_address: string | null
          location_point: unknown | null
          scheduled_at: string
          duration_minutes: number | null
          max_participants: number | null
          current_participants: number
          status: ActivityStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          category: GoalCategory
          location_name: string
          location_address?: string | null
          location_point?: unknown | null
          scheduled_at: string
          duration_minutes?: number | null
          max_participants?: number | null
          current_participants?: number
          status?: ActivityStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          category?: GoalCategory
          location_name?: string
          location_address?: string | null
          location_point?: unknown | null
          scheduled_at?: string
          duration_minutes?: number | null
          max_participants?: number | null
          current_participants?: number
          status?: ActivityStatus
          created_at?: string
          updated_at?: string
        }
      }
      irl_activity_participants: {
        Row: {
          id: string
          activity_id: string
          user_id: string
          status: ParticipantStatus
          joined_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          user_id: string
          status?: ParticipantStatus
          joined_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          user_id?: string
          status?: ParticipantStatus
          joined_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_match_score: {
        Args: {
          user1_uuid: string
          user2_uuid: string
        }
        Returns: number
      }
      find_accountability_matches: {
        Args: {
          for_user_id: string
          limit_count?: number
        }
        Returns: {
          user_id: string
          username: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          match_score: number
          shared_categories: string[]
        }[]
      }
      find_irl_matches: {
        Args: {
          for_user_id: string
          max_distance_meters?: number
          limit_count?: number
        }
        Returns: {
          user_id: string
          username: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          distance_km: number
          match_score: number
          shared_categories: string[]
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// =====================================================
// TYPE ALIASES FOR EASIER USAGE
// =====================================================

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Goal = Database['public']['Tables']['goals']['Row']
export type GoalInsert = Database['public']['Tables']['goals']['Insert']
export type GoalUpdate = Database['public']['Tables']['goals']['Update']

export type Match = Database['public']['Tables']['matches']['Row']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

export type Checkin = Database['public']['Tables']['checkins']['Row']
export type CheckinInsert = Database['public']['Tables']['checkins']['Insert']
export type CheckinUpdate = Database['public']['Tables']['checkins']['Update']

export type IRLActivity = Database['public']['Tables']['irl_activities']['Row']
export type IRLActivityInsert = Database['public']['Tables']['irl_activities']['Insert']
export type IRLActivityUpdate = Database['public']['Tables']['irl_activities']['Update']

export type IRLActivityParticipant = Database['public']['Tables']['irl_activity_participants']['Row']
export type IRLActivityParticipantInsert = Database['public']['Tables']['irl_activity_participants']['Insert']
export type IRLActivityParticipantUpdate = Database['public']['Tables']['irl_activity_participants']['Update']

// =====================================================
// ENUMS
// =====================================================

export type GoalCategory =
  | 'fitness'
  | 'nutrition'
  | 'learning'
  | 'reading'
  | 'creative'
  | 'career'
  | 'finance'
  | 'mindfulness'
  | 'social'
  | 'other'

export type GoalFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'custom'

export type GoalStatus =
  | 'active'
  | 'completed'
  | 'paused'
  | 'abandoned'

export type MatchStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'blocked'

export type CheckinMood =
  | 'great'
  | 'good'
  | 'okay'
  | 'struggling'

export type ActivityStatus =
  | 'open'
  | 'full'
  | 'cancelled'
  | 'completed'

export type ParticipantStatus =
  | 'confirmed'
  | 'cancelled'
  | 'completed'

export type Gender =
  | 'male'
  | 'female'
  | 'non-binary'
  | 'prefer-not-to-say'

// =====================================================
// FUNCTION RETURN TYPES
// =====================================================

export type AccountabilityMatch = Database['public']['Functions']['find_accountability_matches']['Returns'][0]
export type IRLMatch = Database['public']['Functions']['find_irl_matches']['Returns'][0]

// =====================================================
// EXTENDED TYPES (for frontend use)
// =====================================================

export interface UserWithGoals extends User {
  goals: Goal[]
}

export interface GoalWithCheckins extends Goal {
  checkins: Checkin[]
}

export interface MatchWithUsers extends Match {
  user1: User
  user2: User
}

export interface MatchWithMessages extends Match {
  messages: Message[]
  user1: User
  user2: User
}

export interface IRLActivityWithParticipants extends IRLActivity {
  creator: User
  participants: (IRLActivityParticipant & { user: User })[]
}
