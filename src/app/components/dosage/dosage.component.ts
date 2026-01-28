import { Component } from '@angular/core';

@Component({
  selector: 'app-dosage',
  templateUrl: './dosage.component.html',
  styleUrl: './dosage.component.css'
})
export class DosageComponent {


activeTab: 'volume' | 'dosage' = 'volume';
  shape: string = 'rectangular';
  bottomType: string = 'flat';
  
  dimensions = {
    length: null as number | null,
    width: null as number | null,
    diameter: null as number | null,
    depth: null as number | null,
    shallowDepth: null as number | null,
    deepDepth: null as number | null
  };

  waterParams = {
    currentPh: null as number | null,
    targetPh: 7.4,
    currentChlorine: null as number | null,
    targetChlorine: 2,
    currentAlkalinity: null as number | null,
    targetAlkalinity: 120
  };

  volume: number | null = null;
  dosages: any = null;

  setActiveTab(tab: 'volume' | 'dosage'): void {
    this.activeTab = tab;
  }




  setShape(shape: string): void {
    this.shape = shape;
    this.volume = null;
    this.dosages = null;
  }

  setBottomType(type: string): void {
    this.bottomType = type;
    this.volume = null;
    this.dosages = null;
  }

  calculateVolume(): void {
    const l = this.dimensions.length || 0;
    const w = this.dimensions.width || 0;
    const d = this.dimensions.diameter || 0;
    const depth = this.dimensions.depth || 0;
    const shallow = this.dimensions.shallowDepth || 0;
    const deep = this.dimensions.deepDepth || 0;

    let vol = 0;

    if (this.shape === 'rectangular') {
      if (this.bottomType === 'flat') {
        // Volume = Longueur × Largeur × Profondeur
        vol = l * w * depth;
      } else {
        // Volume = Longueur × Largeur × Profondeur moyenne
        const avgDepth = (shallow + deep) / 2;
        vol = l * w * avgDepth;
      }
    } else if (this.shape === 'round') {
      const radius = d / 2;
      if (this.bottomType === 'flat') {
        // Volume = π × r² × Profondeur
        vol = Math.PI * radius * radius * depth;
      } else {
        const avgDepth = (shallow + deep) / 2;
        vol = Math.PI * radius * radius * avgDepth;
      }
    } else if (this.shape === 'oval') {
      const a = l / 2;
      const b = w / 2;
      if (this.bottomType === 'flat') {
        // Volume = π × a × b × Profondeur
        vol = Math.PI * a * b * depth;
      } else {
        const avgDepth = (shallow + deep) / 2;
        vol = Math.PI * a * b * avgDepth;
      }
    }

    this.volume = vol > 0 ? parseFloat(vol.toFixed(2)) : null;
  }

  calculateDosages(): void {
    if (!this.volume) {
      alert('Veuillez d\'abord calculer le volume de votre piscine');
      return;
    }

    const vol = this.volume;
    const currentPh = this.waterParams.currentPh || 0;
    const targetPh = this.waterParams.targetPh;
    const currentCl = this.waterParams.currentChlorine || 0;
    const targetCl = this.waterParams.targetChlorine;
    const currentAlk = this.waterParams.currentAlkalinity || 0;
    const targetAlk = this.waterParams.targetAlkalinity;

    const phDiff = targetPh - currentPh;
    const clDiff = targetCl - currentCl;
    const alkDiff = targetAlk - currentAlk;

    let phPlus = 0;
    let phMinus = 0;
    let chlorine = 0;
    let alkalinityPlus = 0;

    // Formules de dosage basées sur les standards de l'industrie
    if (phDiff > 0) {
      // pH+ (carbonate de sodium): environ 150g pour augmenter pH de 0.1 par 10m³
      phPlus = Math.abs(phDiff) * 10 * vol * 15;
    } else if (phDiff < 0) {
      // pH- (bisulfate de sodium): environ 100g pour diminuer pH de 0.1 par 10m³
      phMinus = Math.abs(phDiff) * 10 * vol * 10;
    }

    if (clDiff > 0) {
      // Chlore: environ 20g par m³ pour augmenter de 1 ppm
      chlorine = clDiff * vol * 20;
    }

    if (alkDiff > 0) {
      // Alcalinité: environ 18g de bicarbonate par m³ pour augmenter de 10 ppm
      alkalinityPlus = (alkDiff / 10) * vol * 18;
    }

    this.dosages = {
      phPlus: phPlus > 0 ? Math.round(phPlus) : 0,
      phMinus: phMinus > 0 ? Math.round(phMinus) : 0,
      chlorine: chlorine > 0 ? Math.round(chlorine) : 0,
      alkalinityPlus: alkalinityPlus > 0 ? Math.round(alkalinityPlus) : 0
    };
  }

  resetVolume(): void {
    this.volume = null;
    this.dosages = null;
  }
}



