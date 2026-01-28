import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {



   openIndex: number | null = null;

  toggleQuestion(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }

  faqs = [
    {
      question: "À quelle fréquence faut-il nettoyer une piscine ?",
      answer:
        "Il est recommandé de nettoyer la piscine au moins une fois par semaine afin de garantir une eau propre et saine."
    },
    {
      question: "Quels sont les produits essentiels pour l’entretien d’une piscine ?",
      answer:
        "Les produits essentiels sont le chlore, le régulateur de pH, l’anti-algues et le floculant."
    },
    {
      question: "Pourquoi l’eau de ma piscine devient-elle trouble ?",
      answer:
        "Une eau trouble est souvent causée par un déséquilibre du pH, une filtration insuffisante ou un manque de désinfectant."
    },
    {
      question: "Quand faut-il remplacer le filtre de piscine ?",
      answer:
        "Le filtre doit être remplacé tous les 2 à 5 ans selon son type et la fréquence d’utilisation."
    },
    {
      question: "Quels sont les avantages d’un système sanitaire de qualité ?",
      answer:
        "Un bon système sanitaire garantit une meilleure hygiène, une économie d’eau et une durabilité accrue des installations."
    }
  ];
}
