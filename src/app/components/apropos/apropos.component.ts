import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-apropos',
  templateUrl: './apropos.component.html',
  styleUrl: './apropos.component.css'
})
export class AproposComponent {
isBrowser = false;

  chartType: 'bar' | 'pie' | 'line' = 'bar';

  // ECharts option object
  chartOption: any;

  // Sample data
  data = [
    { name: 'Users', value: 40 },
    { name: 'Admins', value: 10 },
    { name: 'Guests', value: 30 }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.updateChartOption();
  }

  updateChartOption() {
    if (this.chartType === 'bar') {
      this.chartOption = {
        tooltip: {},
        xAxis: {
          type: 'category',
          data: this.data.map(d => d.name)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar',
            data: this.data.map(d => d.value)
          }
        ]
      };
    } else if (this.chartType === 'pie') {
      this.chartOption = {
        tooltip: { trigger: 'item' },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: this.data.map(d => ({ name: d.name, value: d.value }))
          }
        ]
      };
    } else if (this.chartType === 'line') {
      this.chartOption = {
        tooltip: {},
        xAxis: {
          type: 'category',
          data: this.data.map(d => d.name)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'line',
            data: this.data.map(d => d.value)
          }
        ]
      };
    }
  }

  onTypeChange() {
    this.updateChartOption();
  }
}
