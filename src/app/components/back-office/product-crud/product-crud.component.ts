import { Component, OnInit } from '@angular/core';
import { ProductServiceService } from '../../../services/product-service.service';
import { CategoryServiceService } from '../../../services/category-service.service';
import { Product } from '../../../models/product';
import { Category } from '../../../models/category';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product-crud',
  templateUrl: './product-crud.component.html',
  styleUrl: './product-crud.component.css'
})
export class ProductCrudComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  
  showProductForm: boolean = false;
  editingProductId: number | null = null;
  searchTerm: string = '';
  
  productFormData: any = {
    code: null,
    titre: '',
    description: '',
    prix: 0,
    stock: 0,
    lieuDeProduction: '',
    image: '',
    category: null
  };

  successMessage: string = '';
  errorMessage: string = '';
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private productService: ProductServiceService,
    private categoryService: CategoryServiceService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCategoriesAndProducts();
  }

  /**
   * Load categories first, then extract products from each category
   * This ensures each product has its category properly attached
   */
  loadCategoriesAndProducts(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        
        // Extract all products from all categories
        const allProducts: Product[] = [];
        
        categories.forEach((category) => {
          if (category.products && category.products.length > 0) {
            category.products.forEach((product: Product) => {
              // Attach the category reference to each product
              product.category = category;
              allProducts.push(product);
            });
          }
        });
        
        this.products = allProducts;
        this.filteredProducts = allProducts;
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des données');
        console.error(error);
      }
    });
  }

  openProductForm(product?: Product): void {
    this.showProductForm = true;
    if (product) {
      this.editingProductId = product.code;
      // Deep copy to avoid modifying the original product
      this.productFormData = {
        code: product.code,
        titre: product.titre,
        description: product.description,
        prix: product.prix,
        stock: product.stock,
        lieuDeProduction: product.lieuDeProduction,
        image: product.image,
        category: product.category
      };
      
      // Set image preview if editing
      if (product.image) {
        this.imagePreview = `http://localhost:8085/${product.image}`;
      }
    } else {
      this.resetProductForm();
    }
  }

  closeProductForm(): void {
    this.showProductForm = false;
    this.resetProductForm();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  resetProductForm(): void {
    this.productFormData = {
      code: null,
      titre: '',
      description: '',
      prix: 0,
      stock: 0,
      lieuDeProduction: '',
      image: '',
      category: null
    };
    this.editingProductId = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  saveProduct(): void {
    if (!this.productFormData.titre || !this.productFormData.prix) {
      this.showError('Veuillez remplir les champs obligatoires');
      return;
    }

    // If user selected a new image, upload it first
    if (this.selectedFile) {
      this.uploadImageAndSave();
    } else {
      // No new image selected, proceed with create/update
      if (this.editingProductId) {
        this.updateProduct();
      } else {
        this.createProduct();
      }
    }
  }

  uploadImageAndSave(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:8085/api/products/upload', formData, { responseType: 'text' })
      .subscribe({
        next: (fileName: string) => {
          // Set the image path (backend will prepend uploads/)
          this.productFormData.image = `uploads/${fileName}`;

          // Now create or update the product
          if (this.editingProductId) {
            this.updateProduct();
          } else {
            this.createProduct();
          }
        },
        error: (error) => {
          this.showError('Erreur lors du téléversement de l\'image');
          console.error(error);
        }
      });
  }

  createProduct(): void {
    // Prepare data for backend - send only category ID to avoid circular reference
    const productData = this.prepareProductDataForBackend();
    
    this.productService.createProduct(productData).subscribe({
      next: () => {
        this.showSuccess('Produit créé avec succès');
        this.closeProductForm();
        this.loadCategoriesAndProducts();
      },
      error: (error) => {
        this.showError('Erreur lors de la création du produit');
        console.error(error);
      }
    });
  }

  updateProduct(): void {
    // Prepare data for backend - send only category ID to avoid circular reference
    const productData = this.prepareProductDataForBackend();
    
    this.productService.updateProduct(this.editingProductId!, productData).subscribe({
      next: () => {
        this.showSuccess('Produit mis à jour avec succès');
        this.closeProductForm();
        this.loadCategoriesAndProducts();
      },
      error: (error) => {
        this.showError('Erreur lors de la mise à jour du produit');
        console.error(error);
      }
    });
  }

  /**
   * Prepare product data for backend by converting category object to just the ID
   * This avoids circular reference issues when serializing to JSON
   */
  prepareProductDataForBackend(): any {
    const productData = {
      code: this.productFormData.code,
      titre: this.productFormData.titre,
      description: this.productFormData.description,
      prix: this.productFormData.prix,
      stock: this.productFormData.stock,
      lieuDeProduction: this.productFormData.lieuDeProduction,
      image: this.productFormData.image,
      // Send only the category object with id_category, not the full nested object
      category: this.productFormData.category ? {
        id_category: this.productFormData.category.id_category
      } : null
    };
    
    return productData;
  }

  deleteProduct(productId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.showSuccess('Produit supprimé avec succès');
          this.loadCategoriesAndProducts();
        },
        error: (error) => {
          this.showError('Erreur lors de la suppression du produit');
          console.error(error);
        }
      });
    }
  }

  searchProducts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      p.titre.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      (p.category?.nom && p.category.nom.toLowerCase().includes(term))
    );
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 3000);
  }

  getCategoryName(categoryId: number | undefined): string {
    if (!categoryId) return 'N/A';
    const category = this.categories.find(c => c.id_category === categoryId);
    return category ? category.nom : 'N/A';
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }
}
