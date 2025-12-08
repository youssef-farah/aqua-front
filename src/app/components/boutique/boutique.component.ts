import { Component,OnInit  } from '@angular/core';
import { Category } from '../../models/category';
import { Product } from '../../models/product';
import { CategoryServiceService } from '../../services/category-service.service';
import { ProductServiceService } from '../../services/product-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-boutique',
  templateUrl: './boutique.component.html',
  styleUrl: './boutique.component.css'
})export class BoutiqueComponent implements OnInit {
  onSortChange($event: Event) {
    throw new Error('Method not implemented.');
  }
  
  resetFilters() {
    this.selectedCategoryId = null;
    this.searchTerm = '';
    this.loadProducts();
  }
  
  filterInStock($event: Event) {
    throw new Error('Method not implemented.');
  }
  
  filterByOrigin(arg0: string) {
    throw new Error('Method not implemented.');
  }
  
  filterByPrice(arg0: number, arg1: number) {
    throw new Error('Method not implemented.');
  }
  
  products: Product[] = [];
  filteredProducts: Product[] = [];
  parentCategories: Category[] = [];
  searchTerm: string = '';
  selectedCategoryId: number | null = null;
  expandedCategories: Set<number> = new Set();
  categoryChildren: Map<number, Category[]> = new Map();
  loadingChildren: Set<number> = new Set();
  isLoadingProducts: boolean = false;

  constructor(
    private productService: ProductServiceService,
    private categoryService: CategoryServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadParentCategories();
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filterProducts();
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoadingProducts = false;
      }
    });
  }

  loadParentCategories(): void {
    this.categoryService.getAllParentCategories().subscribe({
      next: (data) => {
        this.parentCategories = data;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  toggleCategory(category: Category): void {
    const categoryId = category.id_category;
    
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
      
      // Load children if not already loaded
      if (!this.categoryChildren.has(categoryId) && !this.loadingChildren.has(categoryId)) {
        this.loadingChildren.add(categoryId);
        this.categoryService.getChildren(categoryId).subscribe({
          next: (children) => {
            this.categoryChildren.set(categoryId, children);
            this.loadingChildren.delete(categoryId);
          },
          error: (error) => {
            console.error('Error loading category children:', error);
            this.loadingChildren.delete(categoryId);
          }
        });
      }
    }
  }

  isExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  getChildren(categoryId: number): Category[] {
    return this.categoryChildren.get(categoryId) || [];
  }

  hasChildren(category: Category): boolean {
    return (category.childCategories && category.childCategories.length > 0) || false;
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    
    if (categoryId === null) {
      // Load all products
      this.loadProducts();
    } else {
      // Fetch products for the selected category
      this.loadProductsByCategory(categoryId);
    }
    
    console.log('Selected category ID:', this.selectedCategoryId);
  }

  loadProductsByCategory(categoryId: number): void {
    this.isLoadingProducts = true;
    this.productService.getProductsByCategory(categoryId).subscribe({
      next: (products) => {
        this.products = products;
        this.filterProducts();
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('Error loading products by category:', error);
        this.products = [];
        this.filterProducts();
        this.isLoadingProducts = false;
      }
    });
  }

  onSearchChange(): void {
    this.filterProducts();
  }

  filterProducts(): void {
    // When a category is selected, products are already filtered by the backend
    // So we only need to apply the search filter
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      return matchesSearch;
    });
  }

  onDetailsClick(productId: number): void {
    this.router.navigate(['/product-details', productId]);
  }

  addToCart(product: Product): void {
    console.log('Adding to cart:', product);
    // Implement cart logic here
  }
}