import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { SupabaseService } from '../../core/supabase.service'

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  email = ''
  password = ''
  confirmPassword = ''
  loading = false
  errorMessage = ''
  successMessage = ''

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields'
      return
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match'
      return
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long'
      return
    }

    this.loading = true
    this.errorMessage = ''
    this.successMessage = ''

    try {
      const { user, error } = await this.supabaseService.signUp(
        this.email,
        this.password
      )

      if (error) {
        this.errorMessage = error.message || 'Signup failed'
      } else if (user) {
        if (user.email_confirmed_at) {
          // Email is already confirmed, redirect to app
          this.router.navigate(['/shelf'])
        } else {
          // Email confirmation required
          this.successMessage =
            'Please check your email and click the confirmation link to complete your signup.'
        }
      }
    } catch (error) {
      this.errorMessage = 'An unexpected error occurred'
      console.error('Signup error:', error)
    } finally {
      this.loading = false
    }
  }
}
