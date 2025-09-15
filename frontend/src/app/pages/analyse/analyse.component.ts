import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';   // ✅ ekledik
import * as Tesseract from 'tesseract.js';

@Component({
  selector: 'app-analyse',
  standalone: true,             // ✅ standalone component
  imports: [CommonModule],      // ✅ *ngIf gibi yapılar için gerekli
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css']
})
export class AnalyseComponent {
  selectedFile: File | null = null;
  extractedText: string = '';
  ingredients: string = '';
  isLoading: boolean = false;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  processImage() {
    if (!this.selectedFile) return;

    this.isLoading = true;
    console.log('Starting OCR...');

    Tesseract.recognize(this.selectedFile, 'eng')
      .then((result: any) => {
        this.isLoading = false;
        const text: string = result.data.text;
        this.extractedText = text;

        const match = text.match(/ingredients[:]?([\s\S]+)/i);
        if (match) {
          this.ingredients = match[1].split('\n')[0];
        }
        console.log('OCR result:', text);
      })
      .catch((err: any) => {
        this.isLoading = false;
        console.error('OCR Error:', err);
      });
  }
}

