import { Component, OnInit } from '@angular/core';
import { Offre } from '../../../models/offre';
import { OffreService } from '../../../services/offre.service';
import { identity } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-offres',
  templateUrl: './offres.component.html',
  styleUrl: './offres.component.css'
})export class OffresComponent implements OnInit {
  offres: Offre[] = [];
  loading = false;
  error: string | null = null;
  
  selectedFile: File | null = null;
imagePreview: string | ArrayBuffer | null = null;
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  
  // Form data
  currentOffre: Offre | null = null;
  formData = {
    titre: '',
    description: '',
    prix: 0,
    imageUrl: ''
  };

  constructor(private offreService: OffreService , private http : HttpClient) {}

  ngOnInit(): void {
    this.loadOffres();
  }

  loadOffres(): void {
    this.loading = true;
    this.error = null;
    
    this.offreService.getAll().subscribe({
      next: (data) => {
        this.offres = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load offres. Please try again.';
        this.loading = false;
        console.error('Error loading offres:', err);
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showCreateModal = true;
  }

  openEditModal(offre: Offre): void {
    this.currentOffre = offre;
    this.formData = {
      titre: offre.titre,
      description: offre.description,
      prix: offre.prix,
      imageUrl: offre.imageUrl || ''
    };
    this.showEditModal = true;
  }

  openDeleteModal(offre: Offre): void {
    this.currentOffre = offre;
    this.showDeleteModal = true;
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.currentOffre = null;
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      titre: '',
      description: '',
      prix: 0,
      imageUrl: ''
    };
  }
uploadImage(file: File, callback: (imageUrl: string) => void, errorCallback: () => void): void {
  const formData = new FormData();
  formData.append('file', file);

  this.http.post('http://localhost:8085/api/offres/upload', formData, { responseType: 'text' })
    .subscribe({
      next: (fileName: string) => {
        const imageUrl = `uploads/${fileName}`;
        callback(imageUrl);
      },
      error: (err) => {
        console.error(err);
        errorCallback();
      }
    });
}
  createOffre(): void {
  if (!this.isFormValid()) return;

  // If user selected an image, upload it first
  if (this.selectedFile) {
    this.uploadImage(
      this.selectedFile,
      (imageUrl) => {
        // After upload success, create offre with the image URL
        const newOffre: any = {
          titre: this.formData.titre,
          description: this.formData.description,
          prix: this.formData.prix,
          imageUrl: imageUrl
        };

        this.offreService.create(newOffre).subscribe({
          
          next: () => {
            
            this.loadOffres();
            this.closeModals();
          },
          error: (err) => {
            this.error = 'Failed to create offre. Please try again.';
            console.error('Error creating offre:', err);
          }
        });
      },
      () => {
        this.error = 'Failed to upload image. Please try again.';
      }
    );
    
  } else {
    // If no image selected, create offre without image
    const newOffre: any = {
      titre: this.formData.titre,
      description: this.formData.description,
      prix: this.formData.prix
    };

    // Only add imageUrl if it's provided as text input
    if (this.formData.imageUrl && this.formData.imageUrl.trim() !== '') {
      newOffre.imageUrl = this.formData.imageUrl;
    }

    this.offreService.create(newOffre).subscribe({
      next: () => {
        this.loadOffres();
        this.closeModals();
      },
      error: (err) => {
        this.error = 'Failed to create offre. Please try again.';
        console.error('Error creating offre:', err);
      }
    });
  }
}

  updateOffre(): void {
    if (!this.isFormValid() || !this.currentOffre) return;

    const updatedOffre = new Offre(
      this.currentOffre.id,
      this.formData.titre,
      this.formData.description,
      this.formData.prix,
      this.formData.imageUrl || undefined
    );

    this.offreService.update(this.currentOffre.id, updatedOffre).subscribe({
      next: () => {
        this.loadOffres();
        this.closeModals();
      },
      error: (err) => {
        this.error = 'Failed to update offre. Please try again.';
        console.error('Error updating offre:', err);
      }
    });
  }



  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }
  deleteOffre(): void {
    if (!this.currentOffre) return;

    this.offreService.delete(this.currentOffre.id).subscribe({
      next: () => {
        this.loadOffres();
        this.closeModals();
      },
      error: (err) => {
        this.error = 'Failed to delete offre. Please try again.';
        console.error('Error deleting offre:', err);
      }
    });
  }

  isFormValid(): boolean {
    return this.formData.titre.trim() !== '' && 
           this.formData.description.trim() !== '' && 
           this.formData.prix > 0;
  }

  dismissError(): void {
    this.error = null;
  }
}