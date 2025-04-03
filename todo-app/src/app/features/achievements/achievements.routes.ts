import { Routes } from '@angular/router';

export const ACHIEVEMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('../dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'challenges',
    loadComponent: () => import('../dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'rewards',
    loadComponent: () => import('../dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  }
];