import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { SupabaseService } from '../../core/supabase.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = ''
  password = ''
  loading = false
  errorMessage = ''

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields'
      return
    }

    this.loading = true
    this.errorMessage = ''

    try {
      const { user, error } = await this.supabaseService.signIn(
        this.email,
        this.password
      )

      if (error) {
        this.errorMessage = error.message || 'Login failed'
      } else if (user) {
        this.router.navigate(['/shelf'])
      }
    } catch (error) {
      this.errorMessage = 'An unexpected error occurred'
      console.error('Login error:', error)
    } finally {
      this.loading = false
    }
  }
}
