import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as Tesseract from 'tesseract.js';

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
  raw: string | null = null;   // ✅ fallback için eklendi
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

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

        // OCR sonrası -> backend'e gönder
        this.http.post<any>('http://localhost:3000/api/analyse', { text })
          .subscribe({
            next: (data) => {
              this.isLoading = false;

              // ingredients & analysis parse edilmeye çalışılır
              this.ingredients = data.ingredients || [];
              this.analysis = data.analysis || [];

              // eğer JSON parse edilemezse raw fallback gösterilir
              this.raw = data.raw || null;
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
}

