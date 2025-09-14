import { Injectable } from '@angular/core'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private _supabase: SupabaseClient
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  // Expose supabase client for API service
  get supabase(): SupabaseClient {
    return this._supabase
  }

  constructor() {
    this._supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    )

    // Check if user is already authenticated
    this.getCurrentUser()

    // Listen for auth state changes
    this._supabase.auth.onAuthStateChange((event, session) => {
      this.currentUserSubject.next(session?.user ?? null)
    })
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await this._supabase.auth.getUser()
      this.currentUserSubject.next(user)
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  async signUp(
    email: string,
    password: string
  ): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await this._supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { user: null, error }
      }

      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await this._supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, error }
      }

      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  }

  async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await this._supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  }

  get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null
  }

  get user(): User | null {
    return this.currentUserSubject.value
  }
}
