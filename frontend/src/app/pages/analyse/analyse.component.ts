import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import * as Tesseract from 'tesseract.js'
import { SupabaseService } from 'src/app/core/supabase.service'
import { FormsModule } from '@angular/forms' 

@Component({
  selector: 'app-analyse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css'],
})
export class AnalyseComponent {
  selectedFile: File | null = null
  extractedText: string = ''
  ingredients: any[] = []
  analysis: any[] = []
  raw: string | null = null
  isLoading: boolean = false
  error: string | null = null
  isTextExpanded: boolean = false
  isIngredientsExpanded: boolean = false
  isComparing: boolean = false

  // Modal kontrolü
  showShelfModal: boolean = false

  // Modal form verisi
  shelfFormData = {
    name: '',
    type: '',
    brand: '' 
  }
  

  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0]
  }

  openShelfModal() {
    this.shelfFormData = { name: '', type: '', brand: '' } 
    this.showShelfModal = true
  }
  
  submitShelfForm() {
    const userId = this.supabaseService.user?.id
    if (!userId) return alert('User not found')

      const product = {
        name: this.shelfFormData.name,
        brand: this.shelfFormData.brand, 
        type: this.shelfFormData.type,
        ingredients: this.ingredients.map(i => i.name)
      }
      

    this.http.post(`http://localhost:3000/shelf/${userId}`, product).subscribe({
      next: () => {
        this.showShelfModal = false
        alert('Product added to shelf!')
      },
      error: err => {
        console.error('ERROR:', err)
        alert('Failed to add product:\n' + (err?.error?.error || err?.message || 'Unknown error'))
      }
    })
  }

  processImage() {
    if (!this.selectedFile) return

    this.isLoading = true
    this.error = null
    console.log('Starting OCR...')

    Tesseract.recognize(this.selectedFile, 'eng')
      .then((result: any) => {
        const text: string = result.data.text
        this.extractedText = text
        console.log('OCR result:', text)

        this.http
          .post<any>('http://localhost:3000/api/analyse', { text })
          .subscribe({
            next: (data) => {
              this.isLoading = false
              console.log('Backend analyse response:', data)

              if (data.ingredients && Array.isArray(data.ingredients)) {
                this.ingredients = data.ingredients
              } else if (data.ingredients?.ingredients) {
                this.ingredients = data.ingredients.ingredients
              } else if (data.raw) {
                this.raw = data.raw
                try {
                  const match = data.raw.match(/"ingredients"\s*:\s*\[[\s\S]*?\]/)
                  if (match) {
                    const jsonText = `{${match[0]}}`
                    const parsed = JSON.parse(jsonText)
                    this.ingredients = parsed.ingredients || []
                  }
                } catch (e) {
                  console.warn('Raw içinden ingredient parse edilemedi:', e)
                  this.ingredients = []
                }
              }

              this.analysis = data.analysis || []
            },
            error: (err) => {
              this.isLoading = false
              console.error(err)
              this.error = 'API request failed'
            },
          })
      })
      .catch((err: any) => {
        this.isLoading = false
        console.error('OCR Error:', err)
        this.error = 'OCR failed'
      })
  }

  analyseWithShelf() {
    if (this.ingredients.length === 0) return;
  
    const userId = this.supabaseService.user?.id;
    if (!userId) {
      this.error = 'User not logged in';
      return;
    }
  
    this.isComparing = true;
    this.error = null;
  
    this.http
      .post<any>('http://localhost:3000/compare', {
        userId,
        ingredients: this.ingredients.map((i) => i.name),
      })
      .subscribe({
        next: (res) => {
          this.isComparing = false;
          this.analysis = [];
  
          if (res.productSimilarities && res.productSimilarities.length > 0) {
            res.productSimilarities.forEach((p: any) => {
              this.analysis.push({
                type: 'product',
                name: `📊 ${p.productName}`,
                description: `Overall similarity: ${p.similarity}`,
                effect: 'neutral',
              });
  
              if (p.safetyMessage.includes('not advised')) {
                this.analysis.push({
                  type: 'safety',
                  name: `⚠️ Safety Check`,
                  description: p.safetyMessage,
                  effect: 'harmful',
                });
              } else {
                this.analysis.push({
                  type: 'safety',
                  name: `✅ Safe to Use`,
                  description: '',
                  effect: 'beneficial',
                });
              }
            });
          }
        },
        error: () => {
          this.isComparing = false;
          this.error = 'Comparison failed.';
        },
      });
  }
}