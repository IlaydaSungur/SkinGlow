import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { SupabaseService } from '../../core/supabase.service'
import {
  DailyCheckin,
  CheckinCategory,
} from '../../core/interfaces/daily-checkin.interface'

@Component({
  selector: 'app-daily-checkin-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-checkin-sidebar.component.html',
  styleUrl: './daily-checkin-sidebar.component.css',
})
export class DailyCheckinSidebarComponent implements OnInit {
  isOpen = false
  isSubmitting = false
  checkinData: DailyCheckin = {}
  currentDate = new Date().toISOString().split('T')[0]
  hasCheckinToday = false

  lifestyleCategories: CheckinCategory[] = [
    {
      key: 'mood',
      label: 'Mood',
      description: 'How do you feel today?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'stress',
      label: 'Stress Level',
      description: 'How stressed are you?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'food_quality',
      label: 'Food Quality',
      description: 'How healthy did you eat?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'sleep_quality',
      label: 'Sleep Quality',
      description: 'How well did you sleep?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'water_intake',
      label: 'Water Intake',
      description: 'How much water did you drink?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'exercise',
      label: 'Exercise',
      description: 'How much did you exercise?',
      type: 'rating',
      min: 0,
      max: 10,
    },
  ]

  skinCategories: CheckinCategory[] = [
    {
      key: 'skin_condition_rating',
      label: 'Overall Skin Health',
      description: 'How does your skin look/feel overall?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'acne_severity',
      label: 'Acne/Breakouts',
      description: 'How severe are your breakouts?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'redness',
      label: 'Redness',
      description: 'How red is your skin?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'oiliness',
      label: 'Oiliness',
      description: 'How oily is your skin?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'dryness',
      label: 'Dryness',
      description: 'How dry is your skin?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'itchiness',
      label: 'Itchiness',
      description: 'How itchy is your skin?',
      type: 'rating',
      min: 0,
      max: 10,
    },
  ]

  environmentCategories: CheckinCategory[] = [
    {
      key: 'sun_exposure',
      label: 'Sun Exposure',
      description: 'How much sun did you get?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'pollution_exposure',
      label: 'Pollution Exposure',
      description: 'How much pollution were you exposed to?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'weather',
      label: 'Weather',
      description: 'What was the weather like?',
      type: 'select',
      options: ['humid', 'dry', 'cold', 'hot', 'mild', 'windy'],
    },
  ]

  healthCategories: CheckinCategory[] = [
    {
      key: 'alcohol_consumption',
      label: 'Alcohol',
      description: 'How much alcohol did you consume?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'smoking',
      label: 'Smoking',
      description: 'How much did you smoke?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'caffeine_intake',
      label: 'Caffeine',
      description: 'How much caffeine did you have?',
      type: 'rating',
      min: 0,
      max: 10,
    },
    {
      key: 'menstrual_cycle_phase',
      label: 'Menstrual Cycle',
      description: 'What phase are you in?',
      type: 'select',
      options: [
        'follicular',
        'ovulation',
        'luteal',
        'menstruation',
        'not applicable',
      ],
    },
  ]

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    // Only check today's checkin if user is authenticated
    if (this.supabaseService.user) {
      await this.checkTodaysCheckin()
    }
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen
  }

  async checkTodaysCheckin() {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', this.supabaseService.user?.id)
        .eq('checkin_date', this.currentDate)
        .single()

      if (data && !error) {
        this.hasCheckinToday = true
        this.checkinData = data
      } else {
        this.hasCheckinToday = false
        this.initializeCheckinData()
      }
    } catch (error) {
      console.error("Error checking today's check-in:", error)
      this.initializeCheckinData()
    }
  }

  initializeCheckinData() {
    this.checkinData = {
      checkin_date: this.currentDate,
      notes: '',
    }
  }

  async submitCheckin() {
    if (!this.supabaseService.user) {
      alert('Please log in to submit a check-in.')
      return
    }

    this.isSubmitting = true

    try {
      const checkinData = {
        ...this.checkinData,
        user_id: this.supabaseService.user.id,
        checkin_date: this.currentDate,
        updated_at: new Date().toISOString(),
      }

      let result
      if (this.hasCheckinToday) {
        // Update existing check-in
        result = await this.supabaseService.supabase
          .from('daily_checkins')
          .update(checkinData)
          .eq('user_id', this.supabaseService.user.id)
          .eq('checkin_date', this.currentDate)
      } else {
        // Create new check-in
        result = await this.supabaseService.supabase
          .from('daily_checkins')
          .insert(checkinData)
      }

      if (result.error) {
        throw result.error
      }

      this.hasCheckinToday = true
      alert(
        `Check-in ${
          this.hasCheckinToday ? 'updated' : 'submitted'
        } successfully!`
      )
      this.isOpen = false
    } catch (error) {
      console.error('Error submitting check-in:', error)
      alert('Error submitting check-in. Please try again.')
    } finally {
      this.isSubmitting = false
    }
  }

  getRatingLabel(value: number): string {
    const labels = [
      'Very Poor',
      'Poor',
      'Below Average',
      'Fair',
      'Average',
      'Good',
      'Above Average',
      'Very Good',
      'Excellent',
      'Outstanding',
      'Perfect',
    ]
    return labels[value] || 'Not rated'
  }

  getRatingValue(category: CheckinCategory): number {
    return (this.checkinData[category.key] as number) || 0
  }

  setRatingValue(category: CheckinCategory, value: number) {
    ;(this.checkinData as any)[category.key] = value
  }

  getSelectValue(category: CheckinCategory): string {
    return (this.checkinData[category.key] as string) || ''
  }

  setSelectValue(category: CheckinCategory, value: string) {
    ;(this.checkinData as any)[category.key] = value
  }
}
