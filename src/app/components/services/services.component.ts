import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MailServiceService } from '../../services/mail-service.service';

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

  // Loading & error states
  isSubmitting: boolean = false;
  errorMessage: string = '';

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

  private readonly PRICE_PER_SQM: number = 800;

  constructor(private mailService: MailServiceService) {}

  ngOnInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  showConstructionForm(): void {
    this.showConstruction = true;
    this.showMaintenance = false;
    this.errorMessage = '';
    setTimeout(() => {
      document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  showMaintenanceForm(): void {
    this.showMaintenance = true;
    this.showConstruction = false;
    this.errorMessage = '';
    setTimeout(() => {
      document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  closeConstructionForm(): void {
    this.showConstruction = false;
    this.resetConstructionForm();
  }

  closeMaintenanceForm(): void {
    this.showMaintenance = false;
    this.resetMaintenanceForm();
  }

  calculateConstructionPrice(): void {
    if (this.constructionForm.surface && this.constructionForm.surface > 0) {
      const shapeMultiplier = this.getShapeMultiplier(this.constructionForm.shape);
      this.estimatedPrice = Math.round((this.constructionForm.surface * this.PRICE_PER_SQM * shapeMultiplier) / 100) * 100;
    } else {
      this.estimatedPrice = 0;
    }
  }

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

  submitConstructionForm(): void {
    if (!this.constructionForm.name || !this.constructionForm.phone ||
        !this.constructionForm.shape || !this.constructionForm.surface ||
        !this.constructionForm.depth) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires (*).';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      ...this.constructionForm,
      estimatedPrice: this.estimatedPrice > 0 ? `${this.estimatedPrice} DT` : undefined
    };

    this.mailService.sendConstructionRequest(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showSuccessMessage = true;
        setTimeout(() => this.closeConstructionForm(), 300);
      },
      error: (err: Error) => {
        this.isSubmitting = false;
        this.errorMessage = err.message;
      }
    });
  }

  onOfferChange(): void {
    // can be used for price preview
  }

  submitMaintenanceForm(): void {
    if (!this.maintenanceForm.name || !this.maintenanceForm.phone ||
        !this.maintenanceForm.selectedOffer) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires (*).';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.mailService.sendMaintenanceRequest(this.maintenanceForm).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showSuccessMessage = true;
        setTimeout(() => this.closeMaintenanceForm(), 300);
      },
      error: (err: Error) => {
        this.isSubmitting = false;
        this.errorMessage = err.message;
      }
    });
  }

  closeSuccessMessage(): void {
    this.showSuccessMessage = false;
  }

  private resetConstructionForm(): void {
    this.constructionForm = { name: '', phone: '', email: '', shape: '', surface: null, depth: '', volume: null };
    this.estimatedPrice = 0;
  }

  private resetMaintenanceForm(): void {
    this.maintenanceForm = { name: '', phone: '', email: '', selectedOffer: '' };
  }
}
