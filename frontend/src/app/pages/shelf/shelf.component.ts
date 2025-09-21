import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { SupabaseService } from 'src/app/core/supabase.service'
import { PageCharacterComponent } from '../../components/page-character/page-character.component'

interface SkincareProduct {
  id?: string // 🔥 burada id eklendi
  name: string
  brand: string
  ingredients: string[]
  type: string
  user_id?: string
}

@Component({
  selector: 'app-shelf',
  standalone: true,
  imports: [CommonModule, FormsModule, PageCharacterComponent], // 🔥 ngIf, ngFor, ngModel için
  templateUrl: './shelf.component.html',
  styleUrls: ['./shelf.component.css'],
})
export class ShelfComponent implements OnInit {
  products: SkincareProduct[] = []
  showModal = false
  editingProduct: SkincareProduct | null = null

  newProduct: SkincareProduct = {
    name: '',
    brand: '',
    ingredients: [],
    type: '',
  }

  ingredientsInput = ''

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.fetchProducts()
  }

  async fetchProducts() {
    const user = this.supabaseService.user
    if (!user) return

    const { data, error } = await this.supabaseService.supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Fetch error:', error)
    } else {
      this.products = data || []
    }
  }

  openModal() {
    this.showModal = true
  }

  closeModal() {
    this.showModal = false
    this.resetForm()
    this.editingProduct = null
  }

  resetForm() {
    this.newProduct = {
      name: '',
      brand: '',
      ingredients: [],
      type: '',
    }
    this.ingredientsInput = ''
  }

  async saveProduct() {
    const user = this.supabaseService.user
    if (!user) return

    const productToSave = {
      ...this.newProduct,
      ingredients: this.ingredientsInput.split(',').map((i) => i.trim()),
      user_id: user.id,
    }

    if (this.editingProduct && this.editingProduct.id) {
      const { error } = await this.supabaseService.supabase
        .from('products')
        .update(productToSave)
        .eq('id', this.editingProduct.id)

      if (error) {
        console.error('Update error:', error)
      }
    } else {
      const { error } = await this.supabaseService.supabase
        .from('products')
        .insert(productToSave)

      if (error) {
        console.error('Insert error:', error)
      }
    }

    this.closeModal()
    this.fetchProducts()
  }

  editProduct(product: SkincareProduct) {
    this.editingProduct = product
    this.newProduct = { ...product }
    this.ingredientsInput = product.ingredients.join(', ')
    this.showModal = true
  }

  async deleteProduct(product: SkincareProduct) {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${product.name}"?`
    )
    if (!confirmDelete) return

    if (!product.id) return

    const { error } = await this.supabaseService.supabase
      .from('products')
      .delete()
      .eq('id', product.id)

    if (error) {
      console.error('Delete error:', error)
    } else {
      this.fetchProducts()
    }
  }

  onAddProduct() {
    this.openModal()
  }
  getImageSrc(type: string | undefined | null): string {
    if (!type) return 'assets/images/other.png'
    return `assets/images/${type.toLowerCase()}.png`
  }
  selectedType: string = 'all'

  get filteredProducts() {
    if (this.selectedType === 'all') {
      return this.products
    }
    return this.products.filter(
      (p) => p.type.toLowerCase() === this.selectedType.toLowerCase()
    )
  }
  expandedProductId: string | null | undefined = null

  toggleIngredients(product: SkincareProduct) {
    this.expandedProductId =
      this.expandedProductId === product.id ? null : product.id
  }
}
