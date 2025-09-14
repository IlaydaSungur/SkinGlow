import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, from } from 'rxjs'
import { SupabaseService } from './supabase.service'
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.api.baseUrl

  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService
  ) {}

  /**
   * Get authorization headers with Supabase token
   */
  private async getAuthHeaders(): Promise<HttpHeaders> {
    const session = await this.supabaseService.supabase.auth.getSession()
    const token = session.data.session?.access_token

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    })
  }

  /**
   * Make authenticated HTTP requests
   */
  private makeAuthenticatedRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any
  ): Observable<T> {
    return from(
      this.getAuthHeaders().then((headers) => {
        const options = { headers }

        switch (method) {
          case 'GET':
            return this.http
              .get<T>(`${this.baseUrl}${endpoint}`, options)
              .toPromise()
          case 'POST':
            return this.http
              .post<T>(`${this.baseUrl}${endpoint}`, body, options)
              .toPromise()
          case 'PUT':
            return this.http
              .put<T>(`${this.baseUrl}${endpoint}`, body, options)
              .toPromise()
          case 'DELETE':
            return this.http
              .delete<T>(`${this.baseUrl}${endpoint}`, options)
              .toPromise()
        }
      })
    ) as Observable<T>
  }

  // Public endpoints (no auth required)
  getHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`)
  }

  getProducts(): Observable<any> {
    return from(
      this.getAuthHeaders().then((headers) =>
        this.http.get(`${this.baseUrl}/products`, { headers }).toPromise()
      )
    )
  }

  // Protected endpoints (auth required)
  getUserRoutines(): Observable<any> {
    return this.makeAuthenticatedRequest('GET', '/routines')
  }

  createRoutine(routine: {
    name: string
    steps: string[]
    time_of_day?: string
  }): Observable<any> {
    return this.makeAuthenticatedRequest('POST', '/routines', routine)
  }

  getSkinAnalysis(data: {
    skin_concerns?: string[]
    current_products?: string[]
  }): Observable<any> {
    return this.makeAuthenticatedRequest('POST', '/analysis', data)
  }

  getUserProfile(): Observable<any> {
    return this.makeAuthenticatedRequest('GET', '/profile')
  }
}
