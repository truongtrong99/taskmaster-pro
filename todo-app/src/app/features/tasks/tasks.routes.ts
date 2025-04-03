import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';
import { TaskListComponent } from './pages/task-list/task-list.component';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    component: TaskListComponent,
    canActivate: [authGuard],
    title: 'Tasks'
  },
  {
    path: 'new',
    // TaskFormComponent will be implemented in a future iteration
    component: TaskListComponent, // Temporary placeholder
    canActivate: [authGuard],
    title: 'New Task'
  },
  {
    path: ':id',
    // TaskDetailsComponent will be implemented in a future iteration
    component: TaskListComponent, // Temporary placeholder
    canActivate: [authGuard],
    title: 'Task Details',
    // Disable prerendering for this route since it has a parameter
    providers: [
      { provide: 'renderMode', useValue: 'browser' }
    ]
  },
  {
    path: ':id/edit',
    // TaskFormComponent will be implemented in a future iteration
    component: TaskListComponent, // Temporary placeholder
    canActivate: [authGuard],
    title: 'Edit Task',
    // Disable prerendering for this route since it has a parameter
    providers: [
      { provide: 'renderMode', useValue: 'browser' }
    ]
  }
];