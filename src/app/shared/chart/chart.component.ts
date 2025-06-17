import {AfterViewInit, Component, computed, effect, ElementRef, Input, Signal, signal, ViewChild,} from '@angular/core';
import {Chart, registerables} from 'chart.js';
import {WorkEntry} from '../../models/work-entry.model';
import {themeColor} from '../../models/theme-color.model';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: true
})
export class ChartComponent implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() entries: Signal<WorkEntry[]> = signal([]);
  @Input() resolution: Signal<any> = signal(7);

  aggregatedEntries = computed(() => {
    const entries = this.entries();
    const resolution = this.resolution();

    const entriesMap = new Map<string, number>();
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const current = entriesMap.get(dateKey) || 0;
      entriesMap.set(dateKey, current + entry.hours);
    });

    const dates = this.generateDateRange(resolution, entries);

    return dates.map(date => {
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const hours = entriesMap.get(dateKey) || 0;
      const displayDate = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
      return {x: displayDate, y: hours};
    });
  });

  private chartInstance: Chart<'bar', { x: string; y: number }[]> | null = null;

  constructor() {
    Chart.register(...registerables);
    effect(() => {
      if (this.aggregatedEntries().length > 0 && this.chartCanvas?.nativeElement) {
        this.renderChart();
      }
    });
  }

  ngAfterViewInit() {
    if (this.aggregatedEntries().length > 0) {
      this.renderChart();
    }
  }

  private generateDateRange(resolution: number, entries: WorkEntry[]): Date[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (resolution === 0) {
      if (entries.length === 0) return [];

      const dates = entries.map(entry => new Date(entry.date));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

      minDate.setHours(0, 0, 0, 0);
      maxDate.setHours(0, 0, 0, 0);

      return this.getDatesInRange(minDate, maxDate);
    } else {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - (resolution - 1));

      return this.getDatesInRange(startDate, today);
    }
  }

  private getDatesInRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  private getIonicColor(): string {
    let colorRGB = `--ion-color-${themeColor()}-rgb`;
    return getComputedStyle(document.documentElement)
      .getPropertyValue(colorRGB)
      .trim();
  }

  private renderChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const primaryColorRgb = this.getIonicColor();

    this.chartInstance = new Chart<'bar', { x: string; y: number }[]>(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        datasets: [{
          label: 'Hours',
          data: this.aggregatedEntries(),
          backgroundColor: `rgba(${primaryColorRgb}, 0.75)`,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}
