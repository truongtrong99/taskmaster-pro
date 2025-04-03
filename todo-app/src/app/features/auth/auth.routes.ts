import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
      }
      // Other auth routes are commented out until their components are implemented
      // {
      //   path: 'register',
      //   loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
      // },
      // {
      //   path: 'forgot-password',
      //   loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      // },
      // {
      //   path: 'reset-password',
      //   loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      // },
      // {
      //   path: 'verify-email',
      //   loadComponent: () => import('./pages/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
      // }
    ]
  }
];