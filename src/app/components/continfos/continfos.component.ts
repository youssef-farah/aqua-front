import { Component } from '@angular/core';


interface PoolDetails {
  forme: string;
  surface: number;
  profondeur: string;
  volume: number;
}

interface UserInfo {
  name: string;
  phone: string;
  email: string;
}

interface ConstructionEquipment {
  filtreCapacite: string;
  pompeCapacite: string;
  projecteursLED: number;
  transformateurVA: string;
}

@Component({
  selector: 'app-continfos',
  templateUrl: './continfos.component.html',
  styleUrl: './continfos.component.css'
})





export class ContinfosComponent {
currentStep: 'choice' | 'construction-form' | 'maintenance-form' = 'choice';
  selectedService: 'construction' | 'maintenance' | null = null;
  
  // User information
  userInfo: UserInfo = {
    name: '',
    phone: '',
    email: ''
  };
  
  // Pool details
  poolDetails: PoolDetails = {
    forme: '',
    surface: 0,
    profondeur: '',
    volume: 0
  };
  
  // Construction equipment
  equipment: ConstructionEquipment = {
    filtreCapacite: '10',
    pompeCapacite: '1.5',
    projecteursLED: 4,
    transformateurVA: '300'
  };
  
  // Maintenance plans
  maintenancePlans = [
    {
      name: 'Plan Annuel',
      duration: 1,
      interventionsPerMonth: { high: 4, low: 3 },
      totalInterventions: 41,
      pricePerIntervention: 105,
      monthlyPriceHigh: 420,
      monthlyPriceLow: 315,
      annualPrice: 4305,
      features: [
        'Mesure et équilibrage du pH',
        'Équilibrage du chlore multi action',
        'Adjonction d\'algicide tous les 10 jours',
        'Nettoyage du fond et des bords',
        'Lavage des filtres',
        'Produits chimiques inclus'
      ],
      recommended: false
    },
    {
      name: 'Plan Biannuel',
      duration: 2,
      interventionsPerMonth: { high: 4, low: 3 },
      totalInterventions: 82,
      pricePerIntervention: 105,
      monthlyPriceHigh: 420,
      monthlyPriceLow: 315,
      annualPrice: 8610,
      discount: 5,
      features: [
        'Tous les services du Plan Annuel',
        'Priorité pour les interventions',
        'Remise de 5%',
        'Renouvellement automatique',
        'Garantie prolongée'
      ],
      recommended: false
    },
    {
      name: 'Plan Quinquennal',
      duration: 5,
      interventionsPerMonth: { high: 4, low: 3 },
      totalInterventions: 205,
      pricePerIntervention: 105,
      monthlyPriceHigh: 420,
      monthlyPriceLow: 315,
      annualPrice: 21525,
      discount: 15,
      features: [
        'Tous les services du Plan Biannuel',
        'Remise exceptionnelle de 15%',
        'Maintenance préventive avancée',
        'Assistance téléphonique prioritaire',
        'Diagnostic annuel complet gratuit',
        'Remplacement gratuit des accessoires'
      ],
      recommended: true,
      special: 'Offre Spéciale'
    }
  ];
  
  showVolumeCalculator = false;
  
  // Methods
  selectService(service: 'construction' | 'maintenance') {
    this.selectedService = service;
    this.currentStep = service === 'construction' ? 'construction-form' : 'maintenance-form';
  }
  
  goBack() {
    this.currentStep = 'choice';
    this.selectedService = null;
    this.resetForms();
  }
  
  resetForms() {
    this.userInfo = { name: '', phone: '', email: '' };
    this.poolDetails = { forme: '', surface: 0, profondeur: '', volume: 0 };
  }
  
  toggleVolumeCalculator() {
    this.showVolumeCalculator = !this.showVolumeCalculator;
  }
  
  calculateVolume() {
    // Simple volume calculation based on surface and average depth
    if (this.poolDetails.surface && this.poolDetails.profondeur) {
      const depths = this.poolDetails.profondeur.split('–').map(d => parseFloat(d.trim()));
      const avgDepth = depths.length === 2 ? (depths[0] + depths[1]) / 2 : depths[0];
      this.poolDetails.volume = Math.round(this.poolDetails.surface * avgDepth * 100) / 100;
    }
  }
  
  estimateConstructionPrice(): number {
    // Base price calculation
    let basePrice = 15000; // Base price in TND
    
    // Add cost based on pool size
    const surfaceCost = this.poolDetails.surface * 500;
    
    // Add cost based on volume
    const volumeCost = this.poolDetails.volume * 300;
    
    // Equipment costs
    const equipmentCost = 5000;
    
    // Total estimate
    return Math.round(basePrice + surfaceCost + volumeCost + equipmentCost);
  }
  
  getMonthlyMaintenancePrice(plan: any): string {
    const discountedAnnual = plan.annualPrice * (1 - (plan.discount || 0) / 100);
    const avgMonthly = Math.round(discountedAnnual / 12);
    return avgMonthly.toFixed(3);
  }
  
  getTotalPrice(plan: any): string {
    // Extract the number from duration string like "1 an", "2 ans", "5 ans"
    const years = parseInt(plan.duration.split(' ')[0]);
    const totalPrice = plan.annualPrice * years * (1 - (plan.discount || 0) / 100);
    return totalPrice.toFixed(3);
  }
  
  submitConstructionRequest() {
    const estimatedPrice = this.estimateConstructionPrice();
    const message = `
Nouvelle demande de construction de piscine:

Informations client:
- Nom: ${this.userInfo.name}
- Téléphone: ${this.userInfo.phone}
- Email: ${this.userInfo.email}

Détails de la piscine:
- Forme: ${this.poolDetails.forme}
- Surface: ${this.poolDetails.surface} m²
- Profondeur: ${this.poolDetails.profondeur} m
- Volume: ${this.poolDetails.volume} m³

Prix estimé: ${estimatedPrice.toFixed(3)} TND
    `.trim();
    
    alert('Votre demande a été enregistrée. Nous vous contacterons sous peu pour un devis précis.');
    console.log(message);
  }
  
  selectMaintenancePlan(plan: any) {
    const message = `
Nouvelle demande de contrat de maintenance:

Informations client:
- Nom: ${this.userInfo.name}
- Téléphone: ${this.userInfo.phone}
- Email: ${this.userInfo.email}

Plan sélectionné: ${plan.name} (${plan.duration})
Prix total: ${this.getTotalPrice(plan)} TND
    `.trim();
    
    alert('Votre demande a été enregistrée. Nous vous contacterons pour finaliser le contrat.');
    console.log(message);
  }
  
  isFormValid(): boolean {
    return !!(this.userInfo.name && this.userInfo.phone);
  }
  
  isConstructionFormComplete(): boolean {
    return this.isFormValid() && 
           !!(this.poolDetails.forme && this.poolDetails.surface && 
              this.poolDetails.profondeur && this.poolDetails.volume);
  }
}