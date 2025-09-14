import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SupabaseService } from '../../core/supabase.service'
import { User } from '@supabase/supabase-js'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user: User | null = null

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.supabaseService.currentUser$.subscribe((user) => {
      this.user = user
    })
  }
}
