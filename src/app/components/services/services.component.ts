import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-30px)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ServicesComponent implements OnInit {
  // Form visibility flags
  showConstruction: boolean = false;
  showMaintenance: boolean = false;
  showSuccessMessage: boolean = false;

  // Construction form model
  constructionForm = {
    name: '',
    phone: '',
    email: '',
    shape: '',
    surface: null as number | null,
    depth: '',
    volume: null as number | null
  };

  // Maintenance form model
  maintenanceForm = {
    name: '',
    phone: '',
    email: '',
    selectedOffer: ''
  };

  // Estimated price for construction
  estimatedPrice: number = 0;

  // Base price per m² (you can adjust this value)
  private readonly PRICE_PER_SQM: number = 800; // 800 DT per m²

  ngOnInit(): void {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  /**
   * Show construction form section
   */
  showConstructionForm(): void {
    this.showConstruction = true;
    this.showMaintenance = false;
    
    // Scroll to the form section smoothly
    setTimeout(() => {
      const formSection = document.querySelector('.form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Show maintenance form section
   */
  showMaintenanceForm(): void {
    this.showMaintenance = true;
    this.showConstruction = false;
    
    // Scroll to the form section smoothly
    setTimeout(() => {
      const formSection = document.querySelector('.form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Close construction form
   */
  closeConstructionForm(): void {
    this.showConstruction = false;
    this.resetConstructionForm();
  }

  /**
   * Close maintenance form
   */
  closeMaintenanceForm(): void {
    this.showMaintenance = false;
    this.resetMaintenanceForm();
  }

  /**
   * Calculate estimated construction price based on surface area
   */
  calculateConstructionPrice(): void {
    if (this.constructionForm.surface && this.constructionForm.surface > 0) {
      // Base calculation: surface × price per m²
      // You can make this more sophisticated by adding factors for:
      // - depth, shape complexity, additional features, etc.
      this.estimatedPrice = this.constructionForm.surface * this.PRICE_PER_SQM;
      
      // Add shape complexity factor
      const shapeMultiplier = this.getShapeMultiplier(this.constructionForm.shape);
      this.estimatedPrice *= shapeMultiplier;
      
      // Round to nearest 100
      this.estimatedPrice = Math.round(this.estimatedPrice / 100) * 100;
    } else {
      this.estimatedPrice = 0;
    }
  }

  /**
   * Get price multiplier based on pool shape complexity
   */
  private getShapeMultiplier(shape: string): number {
    const multipliers: { [key: string]: number } = {
      'rectangulaire': 1.0,
      'ovale': 1.1,
      'ronde': 1.05,
      'forme-libre': 1.2,
      'haricot': 1.15
    };
    return multipliers[shape] || 1.0;
  }

  /**
   * Submit construction form
   */
  submitConstructionForm(): void {
    // Validate required fields
    if (!this.constructionForm.name || !this.constructionForm.phone || 
        !this.constructionForm.shape || !this.constructionForm.surface || 
        !this.constructionForm.depth) {
      alert('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    // Here you would typically send the form data to your backend
    console.log('Construction Form Submitted:', this.constructionForm);
    console.log('Estimated Price:', this.estimatedPrice);

    // Show success message
    this.showSuccessMessage = true;
    
    // Close the form and reset
    setTimeout(() => {
      this.closeConstructionForm();
    }, 300);
  }

  /**
   * Handle offer selection change
   */
  onOfferChange(): void {
    console.log('Selected offer:', this.maintenanceForm.selectedOffer);
  }

  /**
   * Submit maintenance form
   */
  submitMaintenanceForm(): void {
    // Validate required fields
    if (!this.maintenanceForm.name || !this.maintenanceForm.phone || 
        !this.maintenanceForm.selectedOffer) {
      alert('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    // Here you would typically send the form data to your backend
    console.log('Maintenance Form Submitted:', this.maintenanceForm);

    // Show success message
    this.showSuccessMessage = true;
    
    // Close the form and reset
    setTimeout(() => {
      this.closeMaintenanceForm();
    }, 300);
  }

  /**
   * Close success message
   */
  closeSuccessMessage(): void {
    this.showSuccessMessage = false;
  }

  /**
   * Reset construction form
   */
  private resetConstructionForm(): void {
    this.constructionForm = {
      name: '',
      phone: '',
      email: '',
      shape: '',
      surface: null,
      depth: '',
      volume: null
    };
    this.estimatedPrice = 0;
  }

  /**
   * Reset maintenance form
   */
  private resetMaintenanceForm(): void {
    this.maintenanceForm = {
      name: '',
      phone: '',
      email: '',
      selectedOffer: ''
    };
  }
}