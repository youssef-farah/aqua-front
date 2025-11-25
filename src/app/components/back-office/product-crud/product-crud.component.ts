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
    private categoryService: CategoryServiceService, private http :HttpClient
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des produits');
        console.error(error);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des catégories');
        console.error(error);
      }
    });
  }

  openProductForm(product?: Product): void {
    console.log("yes");
    this.showProductForm = true;
    if (product) {
      this.editingProductId = product.code;
      this.productFormData = { ...product };
    } else {
      this.resetProductForm();
    }
  }

  closeProductForm(): void {
    this.showProductForm = false;
    this.resetProductForm();
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
  }

  saveProduct(): void {
  if (!this.productFormData.titre || !this.productFormData.prix) {
    this.showError('Veuillez remplir les champs obligatoires');
    return;
  }

  // If user selected an image, upload it first
  if (this.selectedFile) {
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:8085/api/products/upload', formData, { responseType: 'text' })
      .subscribe({
        next: (fileName: string) => {
          const imageUrl = `uploads/${fileName}`;
          this.productFormData.image = imageUrl; // ✅ assign correct field name

          // After upload success, create or update product
          if (this.editingProductId) {
            this.updateProduct();
          } else {
            this.createProduct();
          }
        },
        error: (err) => {
          console.error(err);
          this.showError('Erreur lors du téléversement de l’image');
        }
      });
  } else {
    // If no image selected, just create or update directly
    if (this.editingProductId) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }
}


  createProduct(): void {
  this.productService.createProduct(this.productFormData).subscribe({
    next: () => {
      this.showSuccess('Produit créé avec succès');
      this.closeProductForm();
      this.loadProducts();
    },
    error: (error) => {
      this.showError('Erreur lors de la création du produit');
      console.error(error);
    }
  });
}

updateProduct(): void {
  this.productService.updateProduct(this.editingProductId!, this.productFormData).subscribe({
    next: () => {
      this.showSuccess('Produit mis à jour avec succès');
      this.closeProductForm();
      this.loadProducts();
    },
    error: (error) => {
      this.showError('Erreur lors de la mise à jour du produit');
      console.error(error);
    }
  });
}

  deleteProduct(productId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.showSuccess('Produit supprimé avec succès');
          this.loadProducts();
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
      p.description.toLowerCase().includes(term)
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









 onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadImage() {
    if (!this.selectedFile) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    
this.http.post('http://localhost:8085/api/products/upload', formData, { responseType: 'text' })
  .subscribe((fileName: string) => {
    const imageUrl = `http://localhost:8085/uploads/${fileName}`;
    this.productFormData.imageUrl = imageUrl;
     this.saveProduct();

  });
}
}
