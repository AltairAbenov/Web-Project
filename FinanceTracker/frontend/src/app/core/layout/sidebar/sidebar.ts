import { Component, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ICONS } from '../../icons/icons';

interface NavItem {
  label: string;
  route: string;
  iconSvg: string;
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
    { label: 'Dashboard', route: '/dashboard', iconSvg: ICONS.dashboard },
    { label: 'Transactions', route: '/transactions', iconSvg: ICONS.transactions },
    { label: 'Budgets', route: '/budgets', iconSvg: ICONS.budgets },
    { label: 'Categories', route: '/categories', iconSvg: ICONS.categories },
  ];

  constructor() {
    effect(() => {
      document.body.classList.toggle('sidebar-collapsed', this.collapsed());
    });
  }

  toggle(): void {
    this.collapsed.update(v => !v);
  }
}
