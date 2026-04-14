import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard-page/dashboard-page').then(m => m.DashboardPage), canActivate: [authGuard] },
  { path: 'transactions', loadComponent: () => import('./features/transactions/transaction-list/transaction-list').then(m => m.TransactionList), canActivate: [authGuard] },
  { path: 'budgets', loadComponent: () => import('./features/budgets/budget-list/budget-list').then(m => m.BudgetList), canActivate: [authGuard] },
  { path: 'categories', loadComponent: () => import('./features/categories/category-list/category-list').then(m => m.CategoryList), canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' },
];
