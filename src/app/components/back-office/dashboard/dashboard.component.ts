import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js'
import { Product } from '../../../models/product';
import { ProductServiceService } from '../../../services/product-service.service';
import { CategoryServiceService } from '../../../services/category-service.service';

Chart.register(...registerables);
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit {
  // Stats
  totalProducts: number = 0;
  totalCategories: number = 0;
  totalOrders: number = 0;
  totalRevenue: number = 0;
  outOfStockProducts: Product[] = [];
  recentOrders: any[] = [];

  // UI
  activeTab: 'overview' | 'products' | 'orders' | 'categories' = 'overview';
  chartInstance: any;

  constructor(
    private productService: ProductServiceService,
    private categoryService: CategoryServiceService
  ) {}

  @Input() graph = {
    id: 1,
    format: 'chart',
    width: 800,
    height: 400
  };

  @ViewChild('mainCanvas') mainCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;

  private mainChart?: Chart;
  private pieChart?: Chart;

  // current selected chart type (three options)
  chartType: ChartType = 'bar';

  // example data — replace with your real series/labels
  private sampleLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  private sampleValues = [1200, 1500, 1100, 1700, 1900, 1400];

  onChartTypeChange(type: string) {
    this.chartType = type as ChartType;
    this.renderMainChart(type);
  }

  ngAfterViewInit(): void {
    // render both charts after view init
    this.renderMainChart(this.chartType || 'bar'); // chartType may be your component state
    this.renderPieChart();
  }

  ngOnDestroy(): void {
    if (this.mainChart) { this.mainChart.destroy(); }
    if (this.pieChart) { this.pieChart.destroy(); }
    // Clean up chart when component is destroyed
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  goToProducts(): void {
    this.activeTab = 'products';
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  goToCategories(): void {
    this.activeTab = 'categories';
    setTimeout(() => {
      document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }


    goToOrders(): void {
    this.activeTab = 'orders';
    setTimeout(() => {
      document.getElementById('orders-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  goToOverview(): void {
    this.activeTab = 'overview';
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 80);
  }

  loadDashboardData(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadStats();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.totalProducts = data.length;
        this.outOfStockProducts = data.filter(p => p.stock === 0);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits', error);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.totalCategories = data.length;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories', error);
      }
    });
  }

  loadStats(): void {
    this.totalOrders = 1;
    this.totalRevenue = 8000;
    this.recentOrders = [
      {
        id: 1,
        amount: 8000,
        date: '11/04/2025 02:00:00',
        status: 'CREATED',
        itemCount: 2
      }
    ];
  }

  private renderMainChart(type: string) {
    if (!this.mainCanvas) return;
    if (this.mainChart) {
      this.mainChart.destroy();
      this.mainChart = undefined;
    }

    const cfg: ChartConfiguration = {
      type: type as any,
      data: {
        labels: this.sampleLabels,
        datasets: [{
          label: 'Ventes',
          data: this.sampleValues,
          backgroundColor: type === 'pie'
            ? [
                '#e90e45ff','#06b6d4','#6bb208ff','#bf0fe2ff','#38bdf8','#0369a1'
              ]
            : 'rgba(12, 125, 46, 0.7)',
          borderColor: 'rgba(2,6,23,0.06)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: type === 'pie' } },
        scales: (type === 'pie') ? undefined : {
          x: { beginAtZero: true },
          y: { beginAtZero: true }
        }
      }
    };

    this.mainChart = new Chart(this.mainCanvas.nativeElement.getContext('2d')!, cfg);
  }

  private renderPieChart() {
    if (!this.pieCanvas) return;
    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = undefined;
    }

    const cfg: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.sampleLabels,
        datasets: [{
          data: this.sampleValues,
          backgroundColor: [
            '#0ea5e9','#d42806ff','#0891b2','#6606edff','#38bdf8','#4dcd07ff'
          ]
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'right' } } }
    };

    this.pieChart = new Chart(this.pieCanvas.nativeElement.getContext('2d')!, cfg);
  }
}





