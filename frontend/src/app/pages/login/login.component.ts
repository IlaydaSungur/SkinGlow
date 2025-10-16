import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { SupabaseService } from '../../core/supabase.service'
import { GooeyOverlayService } from '../../services/gooey-overlay.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gooeyCanvas', { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>
  @ViewChild('pageElement', { static: false }) pageRef!: ElementRef<HTMLElement>

  email = ''
  password = ''
  loading = false
  errorMessage = ''
  scrollStarted = false

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private gooeyOverlayService: GooeyOverlayService
  ) {}

  ngOnInit(): void {
    this.setupScrollDetection()
  }

  ngAfterViewInit(): void {
    if (this.canvasRef && this.pageRef) {
      const success = this.gooeyOverlayService.init(
        this.canvasRef.nativeElement,
        this.pageRef.nativeElement
      )

      if (success) {
        this.gooeyOverlayService.updateParams({
          color: [0.058, 0.639, 0.572], 
          speed: 0.15,
          scale: 0.2,
        })
      }
    }
  }

  ngOnDestroy(): void {
    this.gooeyOverlayService.destroy()
  }

  private setupScrollDetection(): void {
    let ticking = false

    const updateScrollStatus = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      this.scrollStarted = scrollTop > 50
      ticking = false
    }

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollStatus)
        ticking = true
      }
    }

    window.addEventListener('scroll', requestTick)
  }

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
