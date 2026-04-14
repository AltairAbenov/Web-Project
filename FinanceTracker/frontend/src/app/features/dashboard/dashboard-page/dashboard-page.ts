import { Component, computed, signal, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction';
import { BudgetService } from '../../../core/services/budget';
import { AnalyticsService, MonthlyData } from '../../../core/services/analytics';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements AfterViewInit {
  @ViewChild('barChart') barChartEl!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartEl!: ElementRef<HTMLCanvasElement>;

  constructor(
    public txnService: TransactionService,
    public budgetService: BudgetService,
    public analytics: AnalyticsService,
  ) {}

  recentTransactions = computed(() => this.txnService.getWithCategory().slice(0, 5));
  budgets = computed(() => this.budgetService.getCurrentMonth());
  monthlyData = computed(() => this.analytics.getLast6Months());
  expenseByCategory = computed(() => {
    const now = new Date();
    return this.txnService.getExpenseByCategory(now.getFullYear(), now.getMonth());
  });

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
  }

  budgetPercent(b: any): number {
    if (!b.amount) return 0;
    return Math.min(100, Math.round((b.spent / b.amount) * 100));
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.drawBarChart();
      this.drawPieChart();
    }, 100);
  }

  drawBarChart(): void {
    const canvas = this.barChartEl?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.monthlyData();
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    const pad = { top: 20, right: 20, bottom: 40, left: 20 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;
    const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);

    ctx.clearRect(0, 0, w, h);

    const barGroupW = chartW / data.length;
    const barW = barGroupW * 0.3;
    const gap = barGroupW * 0.1;

    data.forEach((d, i) => {
      const x = pad.left + i * barGroupW;
      const incomeH = (d.income / maxVal) * chartH;
      const expenseH = (d.expense / maxVal) * chartH;

      // Income bar
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      const ix = x + gap;
      const iy = pad.top + chartH - incomeH;
      roundRect(ctx, ix, iy, barW, incomeH, 4);
      ctx.fill();

      // Expense bar
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      const ex = x + gap + barW + 4;
      const ey = pad.top + chartH - expenseH;
      roundRect(ctx, ex, ey, barW, expenseH, 4);
      ctx.fill();

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barGroupW / 2, h - pad.bottom + 20);
    });

    // Grid lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    }
  }

  drawPieChart(): void {
    const canvas = this.pieChartEl?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.expenseByCategory();
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    const cx = w * 0.35, cy = h / 2;
    const r = Math.min(cx - 10, cy - 10);
    const total = data.reduce((s, d) => s + d.total, 0) || 1;

    ctx.clearRect(0, 0, w, h);

    let angle = -Math.PI / 2;
    data.forEach(d => {
      const slice = (d.total / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      angle += slice;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Legend
    const legendX = w * 0.65;
    let legendY = 20;
    ctx.font = '11px Inter, sans-serif';
    data.slice(0, 6).forEach(d => {
      ctx.fillStyle = d.color;
      ctx.fillRect(legendX, legendY, 10, 10);
      ctx.fillStyle = '#f1f5f9';
      ctx.textAlign = 'left';
      ctx.fillText(`${d.icon} ${d.name}`, legendX + 16, legendY + 9);
      const pct = Math.round((d.total / total) * 100);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${pct}%`, legendX + 130, legendY + 9);
      legendY += 22;
    });
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return;
  r = Math.min(r, h / 2, w / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, 0);
  ctx.arcTo(x, y + h, x, y, 0);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
