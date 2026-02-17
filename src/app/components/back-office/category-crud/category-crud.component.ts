import { Component, OnInit } from '@angular/core';
import { CategoryServiceService } from '../../../services/category-service.service';
import { Category } from '../../../models/category';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-category-crud',
  templateUrl: './category-crud.component.html',
  styleUrl: './category-crud.component.css'
})
export class CategoryCrudComponent implements OnInit {
  categories: Category[] = [];
  parentCategories: Category[] = [];
  expandedCategories: Set<number> = new Set();
  searchTerm: string = '';
  
  showCategoryForm: boolean = false;
  editingCategoryId: number | null = null;
  selectedParentCategoryId: number | null = null;
  
  categoryFormData: any = {
    nom: '',
    description: '',
    image: '',
    ParentCategory: null
  };

  successMessage: string = '';
  errorMessage: string = '';
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private categoryService: CategoryServiceService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        
        // Debug logging
        console.log('All categories loaded:', this.categories);
        this.categories.forEach(cat => {
          console.log(`Category: ${cat.nom}, ID: ${cat.id_category}, Parent:`, cat.parentCategory);
        });
        
        this.parentCategories = this.getFilteredParentCategories();
        console.log('Filtered parent categories:', this.parentCategories);
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des catégories');
        console.error(error);
      }
    });
  }

  getFilteredParentCategories(): Category[] {
    // Get only categories where parentCategory is null or undefined (true parent categories)
    const parents = this.categories.filter(cat => 
      !cat.parentCategory || cat.parentCategory === null
    );
    
    console.log('Total categories:', this.categories.length);
    console.log('Parent categories:', parents.length);
    console.log('Parents:', parents);
    
    if (!this.searchTerm.trim()) {
      return parents;
    }

    const searchLower = this.searchTerm.toLowerCase();
    
    // Filter parents that match search or have matching children
    return parents.filter(parent => {
      const parentMatches = parent.nom.toLowerCase().includes(searchLower);
      const hasMatchingChild = this.hasMatchingDescendant(parent, searchLower);
      
      // Auto-expand if has matching children
      if (!parentMatches && hasMatchingChild) {
        this.expandedCategories.add(parent.id_category);
      }
      
      return parentMatches || hasMatchingChild;
    });
  }

  hasMatchingDescendant(category: Category, searchTerm: string): boolean {
    const children = this.getChildCategories(category.id_category);
    
    for (const child of children) {
      if (child.nom.toLowerCase().includes(searchTerm)) {
        return true;
      }
      if (this.hasMatchingDescendant(child, searchTerm)) {
        this.expandedCategories.add(child.id_category);
        return true;
      }
    }
    
    return false;
  }

  getChildCategories(parentId: number): Category[] {
    const children = this.categories.filter(cat => 
      cat.parentCategory && cat.parentCategory.id_category === parentId
    );
    
    console.log('Children for parent', parentId, ':', children);
    
    if (!this.searchTerm.trim()) {
      return children;
    }

    const searchLower = this.searchTerm.toLowerCase();
    return children.filter(child => {
      const childMatches = child.nom.toLowerCase().includes(searchLower);
      const hasMatchingChild = this.hasMatchingDescendant(child, searchLower);
      return childMatches || hasMatchingChild;
    });
  }

  hasChildren(categoryId: number): boolean {
    const hasKids = this.categories.some(cat => 
      cat.parentCategory && cat.parentCategory.id_category === categoryId
    );
    return hasKids;
  }

  toggleExpand(categoryId: number): void {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  isExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  onSearchChange(): void {
    this.parentCategories = this.getFilteredParentCategories();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.expandedCategories.clear();
    this.parentCategories = this.getFilteredParentCategories();
  }

  getParentCategoryName(): string {
    if (!this.selectedParentCategoryId) return '';
    const parent = this.categories.find(c => c.id_category === this.selectedParentCategoryId);
    return parent ? parent.nom : '';
  }

  openCategoryForm(category?: Category): void {
    this.showCategoryForm = true;
    if (category) {
      this.editingCategoryId = category.id_category;
      this.categoryFormData = { ...category };
      
      // IMPORTANT: Set the selected parent category ID properly
      if (category.parentCategory && category.parentCategory.id_category) {
        this.selectedParentCategoryId = category.parentCategory.id_category;
      } else {
        this.selectedParentCategoryId = null;
      }
      
      console.log('Editing category:', category);
      console.log('Parent category ID:', this.selectedParentCategoryId);
      
      // Set image preview if editing
      if (category.image) {
        this.imagePreview = `http://localhost:8085/${category.image}`;
      }
    } else {
      this.resetCategoryForm();
    }
  }

  closeCategoryForm(): void {
    this.showCategoryForm = false;
    this.resetCategoryForm();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  resetCategoryForm(): void {
    this.categoryFormData = {
      nom: '',
      description: '',
      image: '',
      ParentCategory: null
    };
    this.editingCategoryId = null;
    this.selectedParentCategoryId = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  saveCategory(): void {
    if (!this.categoryFormData.nom) {
      this.showError('Veuillez remplir le nom de la catégorie');
      return;
    }

    if (this.selectedFile) {
      this.uploadImageAndSave();
    } else {
      if (this.editingCategoryId) {
        this.updateCategory();
      } else {
        this.createCategory();
      }
    }
  }

  uploadImageAndSave(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:8085/api/categories/upload', formData, { responseType: 'text' })
      .subscribe({
        next: (fileName: string) => {
          this.categoryFormData.image = `uploads/${fileName}`;

          if (this.editingCategoryId) {
            this.updateCategory();
          } else {
            this.createCategory();
          }
        },
        error: (error) => {
          this.showError('Erreur lors du téléversement de l\'image');
          console.error(error);
        }
      });
  }

  createCategory(): void {
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
      image: this.categoryFormData.image,
      parentCategory: null as Category | null
    };

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

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }
}