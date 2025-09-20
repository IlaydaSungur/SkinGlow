export interface DailyCheckin {
  id?: number
  user_id?: string
  checkin_date?: string

  // Lifestyle factors
  mood?: number
  stress?: number
  food_quality?: number
  sleep_quality?: number
  water_intake?: number
  exercise?: number

  // Skin-related
  skin_condition_rating?: number
  acne_severity?: number
  redness?: number
  oiliness?: number
  dryness?: number
  itchiness?: number

  // Environment / external factors
  sun_exposure?: number
  pollution_exposure?: number
  weather?: string

  // Health / body factors
  alcohol_consumption?: number
  smoking?: number
  caffeine_intake?: number
  menstrual_cycle_phase?: string

  notes?: string
  created_at?: string
  updated_at?: string
}

export interface CheckinCategory {
  key: keyof DailyCheckin
  label: string
  description: string
  type: 'rating' | 'text' | 'select'
  options?: string[]
  min?: number
  max?: number
}
