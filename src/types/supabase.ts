export interface User {
  id: string
  email: string
  full_name?: string
  current_cards: any[]
  spending_categories: Record<string, any>
}

export interface CreditCard {
  id: string
  name: string
  issuer: string
  annual_fee: number
  rewards_structure: Record<string, number>
  benefits: string[]
  requirements: Record<string, any>
  is_active: boolean
}

export interface UserRecommendation {
  id: string
  user_id: string
  card_id: string
  estimated_rewards: number
  reasoning: string
  is_viewed: boolean
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id'>
        Update: Partial<Omit<User, 'id'>>
      }
      credit_cards: {
        Row: CreditCard
        Insert: Omit<CreditCard, 'id'>
        Update: Partial<Omit<CreditCard, 'id'>>
      }
      user_recommendations: {
        Row: UserRecommendation
        Insert: Omit<UserRecommendation, 'id'>
        Update: Partial<Omit<UserRecommendation, 'id'>>
      }
    }
  }
} 