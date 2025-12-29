import { Component, OnInit } from '@angular/core';
import { Category } from '../../models/category';
import { Product } from '../../models/product';
import { CategoryServiceService } from '../../services/category-service.service';
import { ProductServiceService } from '../../services/product-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-boutique',
  templateUrl: './boutique.component.html',
  styleUrl: './boutique.component.css'
})
export class BoutiqueComponent implements OnInit {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  parentCategories: Category[] = [];
  allCategories: Category[] = [];
  categoryImages: Map<number, string> = new Map();
  
  searchTerm: string = '';
  selectedCategoryId: number | null = null;
  selectedCategory: Category | null = null;
  hoveredCategoryId: number | null = null;
  
  // Breadcrumb path
  breadcrumbPath: Category[] = [];
  
  currentSort: string = 'default';
  isLoadingProducts: boolean = false;
  isLoadingCategories: boolean = false;
  
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedOrigin: string | null = null;
  inStockOnly: boolean = false;

  constructor(
    private productService: ProductServiceService,
    private categoryService: CategoryServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllCategories();
    this.loadParentCategories();
    this.loadProducts();
  }

  loadAllCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.allCategories = data;
        console.log('All categories loaded:', this.allCategories);
      },
      error: (error) => {
        console.error('Error loading all categories:', error);
      }
    });
  }

  loadParentCategories(): void {
    this.isLoadingCategories = true;
    this.categoryService.getAllParentCategories().subscribe({
      next: (data) => {
        this.parentCategories = data;
        console.log('Parent categories loaded:', this.parentCategories);
        this.loadCategoryImages();
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading parent categories:', error);
        this.isLoadingCategories = false;
      }
    });
  }

  loadChildrenForCategory(categoryId: number): void {
    this.categoryService.getChildren(categoryId).subscribe({
      next: (children) => {
        children.forEach(child => {
          child.parentCategory = { id_category: categoryId } as Category;

          const exists = this.allCategories.find(
            cat => cat.id_category === child.id_category
          );

          if (!exists) {
            this.allCategories.push(child);
          }
        });
      },
      error: (error) => {
        console.error(`Error loading children for category ${categoryId}`, error);
      }
    });
  }

  hasChildrenProperty(category: Category): boolean {
    return category.childCategories !== undefined && 
           category.childCategories !== null && 
           category.childCategories.length > 0;
  }

  getHoveredCategory(): Category | null {
    if (!this.hoveredCategoryId) return null;
    
    const parentCategory = this.parentCategories.find(
      c => c.id_category === this.hoveredCategoryId
    );
    if (parentCategory) return parentCategory;
    
    return this.allCategories.find(
      c => c.id_category === this.hoveredCategoryId
    ) || null;
  }

  loadCategoryImages(): void {
    this.parentCategories.forEach(category => {
      this.productService.getProductsByCategory(category.id_category).subscribe({
        next: (products) => {
          if (products && products.length > 0) {
            this.categoryImages.set(category.id_category, products[0].image);
          }
        },
        error: (error) => {
          console.error('Error loading category image:', error);
        }
      });
    });
  }

  getCategoryImage(categoryId: number): string {
    return this.categoryImages.get(categoryId) || 'mouja.png';
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters();
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoadingProducts = false;
      }
    });
  }

  loadProductsByCategory(categoryId: number): void {
    this.isLoadingProducts = true;
    this.productService.getProductsByCategory(categoryId).subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilters();
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('Error loading products by category:', error);
        this.products = [];
        this.applyFilters();
        this.isLoadingProducts = false;
      }
    });
  }

selectCategory(category: Category | null): void {
  if (category === null) {
    // Reset everything
    this.selectedCategoryId = null;
    this.selectedCategory = null;
    this.breadcrumbPath = [];
    this.loadProducts();
    return;
  }

  this.selectedCategoryId = category.id_category;
  this.selectedCategory = category;

  // ✅ NEW SIMPLE LOGIC
  this.updateBreadcrumbPath(category);

  // Load products for selected category
  this.loadProductsByCategory(category.id_category);

  // Load children if needed
  this.loadChildrenForCategory(category.id_category);
}

updateBreadcrumbPath(category: Category): void {
  // Find if category already exists in breadcrumb
  const index = this.breadcrumbPath.findIndex(
    c => c.id_category === category.id_category
  );

  if (index === -1) {
    // ➕ Category not in path → add it
    this.breadcrumbPath.push(category);
  } else {
    // ⬅️ Category exists → go back to it
    this.breadcrumbPath = this.breadcrumbPath.slice(0, index + 1);
  }

  console.log(
    'Updated breadcrumb:',
    this.breadcrumbPath.map(c => c.nom)
  );
}

  // Build the breadcrumb path from root to current category
  buildBreadcrumbPath(category: Category): void {
    this.breadcrumbPath = [];
    let current: Category | null = category;
    const visited = new Set<number>();

    // Build path from current to root
    while (current && !visited.has(current.id_category)) {
      visited.add(current.id_category);
      this.breadcrumbPath.unshift(current); 
      
      if (current.parentCategory?.id_category) {
        const parentId = current.parentCategory.id_category;
        
        // Try to find parent in allCategories first
        let parent = this.allCategories.find(
          cat => cat.id_category === parentId
        );
        
        // If not found, try parentCategories
        if (!parent) {
          parent = this.parentCategories.find(
            cat => cat.id_category === parentId
          );
        }
        
        current = parent || null;
      } else {
        current = null;
      }
    }
    
    console.log('Breadcrumb path built:', this.breadcrumbPath.map(c => c.nom));
  }

  // Navigate to a category from breadcrumb
  navigateToBreadcrumbCategory(index: number): void {
    if (index === -1) {
      // Navigate to home (all categories)
      this.selectCategory(null);
    } else {
      const category = this.breadcrumbPath[index];
      this.selectCategory(category);
    }
  }

  getChildCategories(categoryId: number): Category[] {
    const parent =
      this.parentCategories.find(c => c.id_category === categoryId) ||
      this.allCategories.find(c => c.id_category === categoryId);

    // Ensure child categories have proper parent reference
    const children = parent?.childCategories || [];
    
    children.forEach(child => {
      if (!child.parentCategory) {
        child.parentCategory = { id_category: categoryId } as Category;
      }
    });
    
    return children;
  }

  hasChildren(categoryId: number): boolean {
    return this.getChildCategories(categoryId).length > 0;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesPrice = (this.minPrice === null || product.prix >= this.minPrice) &&
                          (this.maxPrice === null || product.prix <= this.maxPrice);

      const matchesOrigin = !this.selectedOrigin || 
        product.lieuDeProduction.toLowerCase() === this.selectedOrigin.toLowerCase();

      const matchesStock = !this.inStockOnly || product.stock > 0;

      return matchesSearch && matchesPrice && matchesOrigin && matchesStock;
    });

    this.sortProducts();
  }

  onPriceFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    
    if (value === '') {
      this.minPrice = null;
      this.maxPrice = null;
    } else {
      const [min, max] = value.split('-').map(Number);
      this.minPrice = min;
      this.maxPrice = max;
    }
    
    this.applyFilters();
  }

  onOriginFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedOrigin = selectElement.value || null;
    this.applyFilters();
  }

  filterByPrice(min: number, max: number): void {
    this.minPrice = min;
    this.maxPrice = max;
    this.applyFilters();
  }

  filterByOrigin(origin: string): void {
    this.selectedOrigin = this.selectedOrigin === origin ? null : origin;
    this.applyFilters();
  }

  filterInStock(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.inStockOnly = checkbox.checked;
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedCategoryId = null;
    this.selectedCategory = null;
    this.breadcrumbPath = [];
    this.searchTerm = '';
    this.currentSort = 'default';
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedOrigin = null;
    this.inStockOnly = false;
    this.loadProducts();
  }

  onSortChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.currentSort = selectElement.value;
    this.sortProducts();
  }

  sortProducts(): void {
    switch (this.currentSort) {
      case 'asc':
        this.filteredProducts.sort((a, b) => a.prix - b.prix);
        break;
      case 'desc':
        this.filteredProducts.sort((a, b) => b.prix - a.prix);
        break;
      case 'name':
        this.filteredProducts.sort((a, b) => a.titre.localeCompare(b.titre));
        break;
      case 'pop':
        break;
      case 'default':
      default:
        break;
    }
  }

  onDetailsClick(productId: number): void {
    this.router.navigate(['/product-details', productId]);
  }

  addToCart(product: Product): void {
    console.log('Adding to cart:', product);
  }

  onCategoryHover(categoryId: number | null): void {
    this.hoveredCategoryId = categoryId;
  }

  onCategoryLeave(): void {
    this.hoveredCategoryId = null;
  }

  getNestedCategories(categoryId: number): Category[] {
    return this.allCategories.filter(
      cat => cat.parentCategory?.id_category === categoryId
    );
  }

  getGrandchildrenCategories(parentId: number, childId: number): Category[] {
    return this.allCategories.filter(
      cat => cat.parentCategory?.id_category === childId
    );
  }

  getCategoryPath(category: Category | null): Category[] {
    const path: Category[] = [];
    let current = category;

    while (current) {
      path.unshift(current);
      current = current.parentCategory || null;
    }

    return path;
  }
}