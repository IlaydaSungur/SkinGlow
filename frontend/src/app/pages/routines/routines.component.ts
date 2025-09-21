import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { SupabaseService } from 'src/app/core/supabase.service'

interface RoutineStep {
  step: number
  title: string
  product: string
  productId?: string
  brand?: string
  description: string
  waitTime?: string
  tips: string
}

interface GeneratedRoutine {
  routine: RoutineStep[]
  totalTime: string
  benefits: string
  warnings: string
  routineType: 'morning' | 'night'
}

@Component({
  selector: 'app-routines',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './routines.component.html',
  styleUrl: './routines.component.css',
})
export class RoutinesComponent implements OnInit {
  activeTab: 'morning' | 'night' = 'morning'

  morningRoutine: GeneratedRoutine | null = null
  nightRoutine: GeneratedRoutine | null = null

  isGenerating = false
  error: string | null = null

  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.generateRoutine('morning')
  }

  switchTab(tab: 'morning' | 'night') {
    this.activeTab = tab

    // Generate routine if not already loaded
    if (tab === 'morning' && !this.morningRoutine) {
      this.generateRoutine('morning')
    } else if (tab === 'night' && !this.nightRoutine) {
      this.generateRoutine('night')
    }
  }

  generateRoutine(routineType: 'morning' | 'night') {
    const userId = this.supabaseService.user?.id
    if (!userId) {
      this.error = 'User not logged in'
      return
    }

    this.isGenerating = true
    this.error = null

    this.http
      .post<any>('http://localhost:3000/routines/generate', {
        userId,
        routineType,
      })
      .subscribe({
        next: (response) => {
          this.isGenerating = false

          if (routineType === 'morning') {
            this.morningRoutine = response
          } else {
            this.nightRoutine = response
          }

          // Handle empty shelf case
          if (response.message && response.routine.length === 0) {
            this.error = response.message
          }
        },
        error: (err) => {
          this.isGenerating = false
          console.error('Routine generation error:', err)
          this.error = 'Failed to generate routine. Please try again.'
        },
      })
  }

  regenerateRoutine() {
    if (this.activeTab === 'morning') {
      this.morningRoutine = null
    } else {
      this.nightRoutine = null
    }
    this.generateRoutine(this.activeTab)
  }

  getCurrentRoutine(): GeneratedRoutine | null {
    return this.activeTab === 'morning'
      ? this.morningRoutine
      : this.nightRoutine
  }

  getRoutineTitle(): string {
    return this.activeTab === 'morning'
      ? 'Morning Skincare Routine'
      : 'Night Skincare Routine'
  }
}
