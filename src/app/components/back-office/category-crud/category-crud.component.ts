import { Component, OnInit } from '@angular/core';
import { CategoryServiceService } from '../../../services/category-service.service';
import { Category } from '../../../models/category';

@Component({
  selector: 'app-category-crud',
  templateUrl: './category-crud.component.html',
  styleUrl: './category-crud.component.css'
})
export class CategoryCrudComponent implements OnInit {
  categories: Category[] = [];
  
  showCategoryForm: boolean = false;
  editingCategoryId: number | null = null;
  selectedParentCategoryId: number | null = null;
  
  categoryFormData: any = {
    nom: '',
    description: '',
    ParentCategory: null
  };

  successMessage: string = '';
  errorMessage: string = '';

  constructor(private categoryService: CategoryServiceService) {}

  ngOnInit(): void {
    this.loadCategories();
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

  openCategoryForm(category?: Category): void {
    this.showCategoryForm = true;
    if (category) {
      this.editingCategoryId = category.id_category;
      this.categoryFormData = { ...category };
      // Set the selected parent category ID for the dropdown
      this.selectedParentCategoryId = category.parentCategory?.id_category || null;
    } else {
      this.resetCategoryForm();
    }
  }

  closeCategoryForm(): void {
    this.showCategoryForm = false;
    this.resetCategoryForm();
  }

  resetCategoryForm(): void {
    this.categoryFormData = {
      nom: '',
      description: '',
      ParentCategory: null
    };
    this.editingCategoryId = null;
    this.selectedParentCategoryId = null;
  }

  saveCategory(): void {
    if (!this.categoryFormData.nom) {
      this.showError('Veuillez remplir le nom de la catégorie');
      return;
    }

    if (this.editingCategoryId) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  createCategory(): void {
    // Prepare the category data with the full parent category object
    const categoryData = this.prepareCategoryData();
    
    this.categoryService.createCategory(categoryData).subscribe({
      next: () => {
        console.log(categoryData);
        this.showSuccess('Catégorie créée avec succès');
        this.closeCategoryForm();
        this.loadCategories();
      },
      error: (error) => {
        this.showError('Erreur lors de la création de la catégorie');
        console.error(error);
      }
    });
  }

  updateCategory(): void {
    // Prepare the category data with the full parent category object
    const categoryData = this.prepareCategoryData();
    
    this.categoryService.updateCategory(this.editingCategoryId!, categoryData).subscribe({
      next: () => {
        console.log(categoryData);
        this.showSuccess('Catégorie mise à jour avec succès');
        this.closeCategoryForm();
        this.loadCategories();
      },
      error: (error) => {
        this.showError('Erreur lors de la mise à jour de la catégorie');
        console.error(error);
      }
    });
  }

  prepareCategoryData(): any {
    const data = {
      nom: this.categoryFormData.nom,
      description: this.categoryFormData.description,
      parentCategory: null as Category | null
    };

    // If a parent category is selected, fetch and include the full category object
    if (this.selectedParentCategoryId) {
      const parentCategory = this.categories.find(
        cat => cat.id_category === this.selectedParentCategoryId
      );
      data.parentCategory = parentCategory || null;
    }

    return data;
  }

  deleteCategory(categoryId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          this.showSuccess('Catégorie supprimée avec succès');
          this.loadCategories();
        },
        error: (error) => {
          this.showError('Erreur lors de la suppression de la catégorie');
          console.error(error);
        }
      });
    }
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 3000);
  }
}