import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js'
import { Product } from '../../../models/product';
import { ProductServiceService } from '../../../services/product-service.service';
import { CategoryServiceService } from '../../../services/category-service.service';
import { OrderServiceService } from '../../../services/order-service.service';
import { Order, OrderState } from '../../../models/order';
import { jsPDF } from 'jspdf';

Chart.register(...registerables);
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit {
 
  // STATS
  totalProducts = 0;
  totalCategories = 0;
  totalOrders = 0;
  totalRevenue = 0;

chartPeriod: 'monthly' | 'yearly' = 'monthly';
chartColor = '#007bff';
monthlyData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  values: [1200, 1800, 1400, 2200, 2600, 3000]
};

yearlyData = {
  labels: ['2021', '2022', '2023', '2024'],
  values: [12000, 18000, 24000, 31000]
};

  // CHART DATA
  monthlyLabels: string[] = [];
  monthlyRevenue: number[] = [];

  chartType: ChartType = 'bar';
  private mainChart?: Chart;

  @ViewChild('mainCanvas') mainCanvas!: ElementRef<HTMLCanvasElement>;
chart!: Chart;

  constructor(
    private productService: ProductServiceService,
    private categoryService: CategoryServiceService,
    private orderService: OrderServiceService
  ) {}

  ngAfterViewInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadOrdersAndRevenue();
  }

  // PRODUCTS
  loadProducts(): void {
    this.productService.getAllProducts().subscribe(data => {
      this.totalProducts = data.length;
    });
  }

  // CATEGORIES
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.totalCategories = data.length;
    });
  }

  // ORDERS + REVENUE
  loadOrdersAndRevenue(): void {
    this.orderService.getAll().subscribe((orders: Order[]) => {

      // ONLY DELIVERED ORDERS
      const deliveredOrders = orders.filter(
        o => o.state === OrderState.CONFIRMED
      );

      this.totalOrders = deliveredOrders.length;

      this.totalRevenue = deliveredOrders.reduce(
        (sum, o) => sum + o.total,
        0
      );

      this.buildMonthlyRevenue(deliveredOrders);
      this.renderChart();
    });
  }

  // GROUP BY MONTH
  private buildMonthlyRevenue(orders: Order[]) {
    const map = new Map<string, number>();

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const key = date.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric'
      });

      map.set(key, (map.get(key) || 0) + order.total);
    });

    this.monthlyLabels = Array.from(map.keys());
    this.monthlyRevenue = Array.from(map.values());
  }

  // CHART RENDER
  private renderChart() {
    if (this.mainChart) {
      this.mainChart.destroy();
    }

    const config: ChartConfiguration = {
      type: this.chartType,
      data: {
        labels: this.monthlyLabels,
        datasets: [
          {
            label: 'Revenu (TND)',
            data: this.monthlyRevenue,
            backgroundColor:
              this.chartType === 'pie'
                ? ['#2563eb', '#16a34a', '#f97316', '#9333ea']
                : 'rgba(37,99,235,0.6)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: this.chartType === 'pie' }
        },
        scales:
          this.chartType === 'pie'
            ? undefined
            : {
                y: { beginAtZero: true }
              }
      }
    };

    this.mainChart = new Chart(
      this.mainCanvas.nativeElement,
      config
    );
  }

  // CHANGE CHART TYPE
  onChartTypeChange(type: string) {
    this.chartType = type as ChartType;
    this.renderChart();
  }


  updateChart(data: any) {
  this.chart.data.labels = data.labels;
  this.chart.data.datasets[0].data = data.values;
  this.chart.update();
}


changePeriod(period: 'monthly' | 'yearly') {
  this.chartPeriod = period;

  if (period === 'monthly') {
    this.updateChart(this.monthlyData);
  } else {
    this.updateChart(this.yearlyData);
  }
}
changeColor(event: Event) {
  const color = (event.target as HTMLInputElement).value;
  this.chartColor = color;

  this.chart.data.datasets[0].backgroundColor = color;
  this.chart.data.datasets[0].borderColor = color;
  this.chart.update();
}



exportAsPNG() {
  const canvas = this.mainCanvas.nativeElement;
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'revenus.png';
  link.click();
}


exportAsPDF() {
  const canvas = this.mainCanvas.nativeElement;
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('landscape');
  pdf.text('Revenus', 15, 15);
  pdf.addImage(imgData, 'PNG', 15, 25, 260, 140);
  pdf.save('revenus.pdf');
}


}





