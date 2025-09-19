import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as Tesseract from 'tesseract.js';
import { SupabaseService } from 'src/app/core/supabase.service'; // ✅ kullanıcı id almak için

@Component({
  selector: 'app-analyse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css']
})
export class AnalyseComponent {
  selectedFile: File | null = null;
  extractedText: string = '';
  ingredients: any[] = [];
  analysis: any[] = [];
  raw: string | null = null;   // ✅ fallback için
  isLoading: boolean = false;
  error: string | null = null;
  isTextExpanded: boolean = false;
  isIngredientsExpanded: boolean = false;


  constructor(private http: HttpClient, private supabaseService: SupabaseService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  processImage() {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.error = null;
    console.log('Starting OCR...');

    Tesseract.recognize(this.selectedFile, 'eng')
      .then((result: any) => {
        const text: string = result.data.text;
        this.extractedText = text;
        console.log('OCR result:', text);

        // OCR sonrası -> backend analyse endpoint
        this.http.post<any>('http://localhost:3000/api/analyse', { text })
          .subscribe({
            next: (data) => {
              this.isLoading = false;
              console.log("Backend analyse response:", data);

              // ✅ 1) Normal JSON formatı
              if (data.ingredients && Array.isArray(data.ingredients)) {
                this.ingredients = data.ingredients;
              }
              // ✅ 2) İç içe ingredients
              else if (data.ingredients?.ingredients) {
                this.ingredients = data.ingredients.ingredients;
              }
              // ✅ 3) JSON parse edilemedi, raw dönüyor
              else if (data.raw) {
                this.raw = data.raw;
                try {
                  const match = data.raw.match(/"ingredients"\s*:\s*\[[\s\S]*?\]/);
                  if (match) {
                    const jsonText = `{${match[0]}}`;
                    const parsed = JSON.parse(jsonText);
                    this.ingredients = parsed.ingredients || [];
                  }
                } catch (e) {
                  console.warn("Raw içinden ingredient parse edilemedi:", e);
                  this.ingredients = [];
                }
              }

              // Analysis varsa ekle
              this.analysis = data.analysis || [];
            },
            error: (err) => {
              this.isLoading = false;
              console.error(err);
              this.error = 'API request failed';
            }
          });
      })
      .catch((err: any) => {
        this.isLoading = false;
        console.error('OCR Error:', err);
        this.error = 'OCR failed';
      });
  }

  // ✅ Shelf ile karşılaştırma
isComparing: boolean = false;

analyseWithShelf() {
  if (this.ingredients.length === 0) return;

  const userId = this.supabaseService.user?.id;
  if (!userId) {
    this.error = "User not logged in";
    return;
  }

  this.isComparing = true;   // ✅ start comparing
  this.error = null;

  this.http.post<any>('http://localhost:3000/compare', {
    userId,
    ingredients: this.ingredients.map(i => i.name)
  }).subscribe({
    next: (res) => {
      this.isComparing = false;  // ✅ reset
      if (res.matches.length === 0) {
        this.analysis = [{
          name: "No similarities found",
          description: "",
          effect: "neutral"
        }];
      } else {
        this.analysis = res.matches.map((m: any) => ({
          name: `${m.ingredient} ↔ ${m.shelfItem}`,
          description: `Similarity: ${m.similarity}`,
          effect: 'neutral'
        }));
      }
    },
    error: () => {
      this.isComparing = false;  // ✅ reset on error
      this.error = "Comparison failed.";
    }
  });
}


}

