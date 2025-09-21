import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-page-character',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-character.component.html',
  styleUrl: './page-character.component.css',
})
export class PageCharacterComponent {
  @Input() pageName: string = ''

  get characterImagePath(): string {
    if (!this.pageName) return ''

    // Map page names to their corresponding character images
    const imageMap: { [key: string]: string } = {
      login: 'assets/drawings/login.png',
      profile: 'assets/drawings/profile.png',
      routines: 'assets/drawings/routine.png',
      shelf: 'assets/drawings/shelf.png',
      analyse: 'assets/drawings/analyse.png',
    }

    return imageMap[this.pageName] || ''
  }
}
