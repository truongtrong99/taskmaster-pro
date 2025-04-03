import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    // Using a placeholder route - we'll need to implement the actual component
    loadComponent: () => import('../dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Projects'
  }
  // Commented out routes that reference non-existent components
  // {
  //   path: 'new',
  //   loadComponent: () => import('./pages/project-create/project-create.component').then(m => m.ProjectCreateComponent)
  // },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./pages/project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
  // },
  // {
  //   path: ':id/edit',
  //   loadComponent: () => import('./pages/project-edit/project-edit.component').then(m => m.ProjectEditComponent)
  // },
  // {
  //   path: ':id/board',
  //   loadComponent: () => import('./pages/project-board/project-board.component').then(m => m.ProjectBoardComponent)
  // },
  // {
  //   path: ':id/calendar',
  //   loadComponent: () => import('./pages/project-calendar/project-calendar.component').then(m => m.ProjectCalendarComponent)
  // },
  // {
  //   path: ':id/members',
  //   loadComponent: () => import('./pages/project-members/project-members.component').then(m => m.ProjectMembersComponent)
  // }
];