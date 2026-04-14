import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  collapsed = signal(false);

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Transactions', route: '/transactions', icon: '💸' },
    { label: 'Budgets', route: '/budgets', icon: '🎯' },
    { label: 'Categories', route: '/categories', icon: '🏷️' },
  ];

  toggle(): void {
    this.collapsed.update(v => !v);
  }
}
