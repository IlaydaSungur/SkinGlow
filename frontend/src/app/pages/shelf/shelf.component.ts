import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';         // 💡 Angular directives için
import { FormsModule } from '@angular/forms';           // 💡 [(ngModel)] için
import { SupabaseService } from 'src/app/core/supabase.service';

interface SkincareProduct {
  name: string;
  brand: string;
  ingredients: string[];
  type: string;
  user_id?: string;
}

@Component({
  selector: 'app-shelf',
  standalone: true,                                     // 💡 Standalone component
  imports: [CommonModule, FormsModule],                 // 💡 GEREKLİ MODÜLLER
  templateUrl: './shelf.component.html',
  styleUrls: ['./shelf.component.css']
})
export class ShelfComponent implements OnInit {
  products: SkincareProduct[] = [];
  showModal = false;

  newProduct: SkincareProduct = {
    name: '',
    brand: '',
    ingredients: [],
    type: '',
  };

  ingredientsInput = '';

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  async fetchProducts() {
    const user = this.supabaseService.user;
    if (!user) return;

    const { data, error } = await this.supabaseService.supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Fetch error:', error);
    } else {
      this.products = data || [];
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newProduct = {
      name: '',
      brand: '',
      ingredients: [],
      type: '',
    };
    this.ingredientsInput = '';
  }

  async addProduct() {
    const user = this.supabaseService.user;
    if (!user) return;

    const productToInsert = {
      ...this.newProduct,
      ingredients: this.ingredientsInput.split(',').map(i => i.trim()),
      user_id: user.id,
    };

    const { error } = await this.supabaseService.supabase
      .from('products')
      .insert(productToInsert);

    if (error) {
      console.error('Insert error:', error);
    } else {
      this.closeModal();
      this.fetchProducts(); // refresh list
    }
  }

  onAddProduct() {
    this.openModal();
  }
}
