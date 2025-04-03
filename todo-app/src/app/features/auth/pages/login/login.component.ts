import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthProvider } from '../../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Log in to access your tasks, track progress, and stay organized.</p>
        </div>

        <div class="auth-form">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                placeholder="Your email address"
                [class.is-invalid]="submitted && f['email'].errors"
              />
              <div *ngIf="submitted && f['email'].errors" class="error-message">
                <div *ngIf="f['email'].errors['required']">Email is required</div>
                <div *ngIf="f['email'].errors['email']">Please enter a valid email address</div>
              </div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="password-field">
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  id="password" 
                  formControlName="password" 
                  placeholder="Your password"
                  [class.is-invalid]="submitted && f['password'].errors"
                />
                <button 
                  type="button" 
                  class="password-toggle" 
                  (click)="togglePasswordVisibility()"
                >
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <div *ngIf="submitted && f['password'].errors" class="error-message">
                <div *ngIf="f['password'].errors['required']">Password is required</div>
              </div>
            </div>

            <div class="form-group form-options">
              <div class="remember-me">
                <input type="checkbox" id="rememberMe" formControlName="rememberMe" />
                <label for="rememberMe">Remember me</label>
              </div>
              <a routerLink="/auth/forgot-password" class="forgot-password">Forgot password?</a>
            </div>

            <div class="form-group">
              <button 
                type="submit" 
                class="submit-button" 
                [disabled]="loading"
              >
                {{ loading ? 'Logging in...' : 'Log In' }}
              </button>
            </div>

            <div *ngIf="error" class="error-alert">
              {{ error }}
            </div>
          </form>

          <div class="auth-divider">
            <span>or continue with</span>
          </div>

          <div class="social-auth">
            <button 
              type="button" 
              class="social-button google" 
              (click)="loginWithProvider(AuthProvider.GOOGLE)"
            >
              Google
            </button>
            <button 
              type="button" 
              class="social-button github" 
              (click)="loginWithProvider(AuthProvider.GITHUB)"
            >
              GitHub
            </button>
            <button 
              type="button" 
              class="social-button microsoft" 
              (click)="loginWithProvider(AuthProvider.MICROSOFT)"
            >
              Microsoft
            </button>
          </div>
        </div>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/auth/register">Sign up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f7f9;
      padding: 2rem;
    }

    .auth-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 450px;
      padding: 2rem;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .auth-subtitle {
      color: #6c757d;
      font-size: 0.875rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
      font-size: 0.875rem;
    }

    input[type="email"],
    input[type="password"],
    input[type="text"] {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }

    input.is-invalid {
      border-color: #dc3545;
    }

    .password-field {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #6c757d;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .remember-me {
      display: flex;
      align-items: center;
    }

    .remember-me input {
      margin-right: 0.5rem;
    }

    .forgot-password {
      color: #0d6efd;
      text-decoration: none;
      font-size: 0.875rem;
    }

    .submit-button {
      width: 100%;
      padding: 0.75rem;
      background-color: #0d6efd;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .submit-button:hover {
      background-color: #0b5ed7;
    }

    .submit-button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .error-alert {
      background-color: #f8d7da;
      color: #842029;
      padding: 0.75rem;
      border-radius: 4px;
      margin-top: 1rem;
      font-size: 0.875rem;
    }

    .auth-divider {
      position: relative;
      text-align: center;
      margin: 1.5rem 0;
    }

    .auth-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #ced4da;
    }

    .auth-divider span {
      position: relative;
      background-color: white;
      padding: 0 1rem;
      color: #6c757d;
      font-size: 0.875rem;
    }

    .social-auth {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .social-button {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      background-color: white;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .social-button.google:hover {
      background-color: #f8f9fa;
      border-color: #ea4335;
    }

    .social-button.github:hover {
      background-color: #f8f9fa;
      border-color: #333;
    }

    .social-button.microsoft:hover {
      background-color: #f8f9fa;
      border-color: #00a4ef;
    }

    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      color: #6c757d;
      font-size: 0.875rem;
    }

    .auth-footer a {
      color: #0d6efd;
      text-decoration: none;
      font-weight: 500;
    }
  `]
})
export class LoginComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl = '/';
  error = '';
  showPassword = false;
  AuthProvider = AuthProvider; // Make enum available to the template

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    
    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({
      email: this.f['email'].value,
      password: this.f['password'].value,
      rememberMe: this.f['rememberMe'].value
    })
    .subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: error => {
        this.error = error.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }

  loginWithProvider(provider: AuthProvider) {
    this.loading = true;
    this.error = '';

    this.authService.loginWithProvider(provider)
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
        error: error => {
          this.error = error.message || `Login with ${provider} failed. Please try again.`;
          this.loading = false;
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}