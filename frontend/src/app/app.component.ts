import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
} from '@angular/router'
import { SupabaseService } from './core/supabase.service'
import { User } from '@supabase/supabase-js'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'SkinGlow'
  user$: Observable<User | null>

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.user$ = this.supabaseService.currentUser$
  }

  ngOnInit() {
    // Initialize authentication state
    this.supabaseService.getCurrentUser()
  }

  async logout() {
    const { error } = await this.supabaseService.signOut()
    if (!error) {
      this.router.navigate(['/login'])
    }
  }
}
