import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms'
import { SupabaseService } from '../../core/supabase.service'
import { ApiService } from '../../core/api.service'
import { User } from '@supabase/supabase-js'
import {
  UserProfile,
  ProfileUpdateRequest,
  ProfileResponse,
} from '../../core/interfaces/profile.interface'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user: User | null = null
  profile: UserProfile | null = null
  profileForm: FormGroup
  isEditing = false
  isLoading = false
  isUpdating = false
  error: string | null = null
  success: string | null = null

  genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ]

  constructor(
    private supabaseService: SupabaseService,
    private apiService: ApiService,
    private formBuilder: FormBuilder
  ) {
    this.profileForm = this.formBuilder.group({
      full_name: [''],
      age: ['', [Validators.min(0), Validators.max(150)]],
      gender: [''],
      birth_date: [''],
      country: [''],
      skin_condition: [''],
      allergies: [''],
    })
  }

  ngOnInit() {
    this.supabaseService.currentUser$.subscribe((user) => {
      this.user = user
      if (user) {
        this.loadProfile()
      }
    })
  }

  loadProfile() {
    this.isLoading = true
    this.error = null

    this.apiService.getUserProfile().subscribe({
      next: (response: ProfileResponse) => {
        this.profile = response.profile
        this.populateForm()
        this.isLoading = false
      },
      error: (error: any) => {
        console.error('Error loading profile:', error)
        this.error = 'Failed to load profile data'
        this.isLoading = false
      },
    })
  }

  populateForm() {
    if (this.profile) {
      this.profileForm.patchValue({
        full_name: this.profile.full_name || '',
        age: this.profile.age || '',
        gender: this.profile.gender || '',
        birth_date: this.profile.birth_date || '',
        country: this.profile.country || '',
        skin_condition: this.profile.skin_condition || '',
        allergies: this.profile.allergies || '',
      })
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing
    this.error = null
    this.success = null

    if (!this.isEditing) {
      // Reset form to current profile data
      this.populateForm()
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched()
      return
    }

    this.isUpdating = true
    this.error = null
    this.success = null

    const formData = this.profileForm.value
    const updateData: ProfileUpdateRequest = {
      full_name: formData.full_name || null,
      age: formData.age ? parseInt(formData.age) : null,
      gender: formData.gender || null,
      birth_date: formData.birth_date || null,
      country: formData.country || null,
      skin_condition: formData.skin_condition || null,
      allergies: formData.allergies || null,
    }

    this.apiService.updateUserProfile(updateData).subscribe({
      next: (response: { message: string; profile: UserProfile }) => {
        this.profile = response.profile
        this.success = 'Profile updated successfully!'
        this.isEditing = false
        this.isUpdating = false

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.success = null
        }, 3000)
      },
      error: (error: any) => {
        console.error('Error updating profile:', error)
        this.error = error.error?.message || 'Failed to update profile'
        this.isUpdating = false
      },
    })
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key)
      if (control) {
        control.markAsTouched()
      }
    })
  }

  getFieldError(fieldName: string): string | null {
    const field = this.profileForm.get(fieldName)
    if (field && field.touched && field.errors) {
      if (field.errors['min']) {
        return `${fieldName} must be at least ${field.errors['min'].min}`
      }
      if (field.errors['max']) {
        return `${fieldName} must be at most ${field.errors['max'].max}`
      }
      if (field.errors['required']) {
        return `${fieldName} is required`
      }
    }
    return null
  }
}
