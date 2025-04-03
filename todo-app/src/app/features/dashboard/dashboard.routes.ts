import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  }
];