import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
  NavigationEnd,
} from '@angular/router'
import { SupabaseService } from './core/supabase.service'
import { User } from '@supabase/supabase-js'
import { Observable, of, combineLatest } from 'rxjs'
import { filter, map, startWith } from 'rxjs/operators'
import { DailyCheckinSidebarComponent } from './components/daily-checkin-sidebar/daily-checkin-sidebar.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    DailyCheckinSidebarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'SkinGlow'
  user$: Observable<User | null>
  showDailyCheckin$: Observable<boolean>
  showNavbar$: Observable<boolean>

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.user$ = this.supabaseService.currentUser$

    // Only show daily check-in on authenticated routes (not login/signup)
    const routeCheck$ = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event: NavigationEnd) => {
        const url = event.urlAfterRedirects
        const isAuthPage = url === '/login' || url === '/signup'
        return !isAuthPage
      }),
      startWith(this.getInitialShowState())
    )

    // Combine user authentication and route check
    this.showDailyCheckin$ = combineLatest([this.user$, routeCheck$]).pipe(
      map(([user, shouldShow]) => !!user && shouldShow)
    )

    // Hide navbar on auth pages (login/signup)
    this.showNavbar$ = routeCheck$
  }

  ngOnInit() {
    // Initialize authentication state
    this.supabaseService.getCurrentUser()
  }

  private getInitialShowState(): boolean {
    const currentUrl = this.router.url
    const isAuthPage = currentUrl === '/login' || currentUrl === '/signup'
    return !isAuthPage
  }

  async logout() {
    const { error } = await this.supabaseService.signOut()
    if (!error) {
      this.router.navigate(['/login'])
    }
  }
}
