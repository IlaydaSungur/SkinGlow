export interface UserProfile {
  id: string
  full_name: string | null
  age: number | null
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
  birth_date: string | null // ISO date string
  country: string | null
  skin_condition: string | null
  allergies: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ProfileUpdateRequest {
  full_name?: string | null
  age?: number | null
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
  birth_date?: string | null
  country?: string | null
  skin_condition?: string | null
  allergies?: string | null
}

export interface ProfileResponse {
  message: string
  user: {
    id: string
    email: string
    created_at: string
    last_sign_in: string
    email_confirmed: boolean
  }
  profile: UserProfile
}
