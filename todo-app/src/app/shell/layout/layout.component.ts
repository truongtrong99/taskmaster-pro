import { Component, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { GamificationService } from '../../core/services/gamification.service';
import { Observable, map, of, switchMap } from 'rxjs';

interface UserLevel {
  level: number;
  progress: number;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1 class="app-title">Todo App</h1>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <h2 class="nav-section-title">Dashboard</h2>
            <ul class="nav-list">
              <li><a routerLink="/dashboard" routerLinkActive="active">Overview</a></li>
              <li><a routerLink="/dashboard/today" routerLinkActive="active">Today</a></li>
              <li><a routerLink="/dashboard/upcoming" routerLinkActive="active">Upcoming</a></li>
              <li><a routerLink="/dashboard/important" routerLinkActive="active">Important</a></li>
              <li><a routerLink="/dashboard/completed" routerLinkActive="active">Completed</a></li>
            </ul>
          </div>
          
          <div class="nav-section">
            <h2 class="nav-section-title">Tasks & Projects</h2>
            <ul class="nav-list">
              <li><a routerLink="/tasks" routerLinkActive="active">All Tasks</a></li>
              <li><a routerLink="/tasks/board" routerLinkActive="active">Task Board</a></li>
              <li><a routerLink="/tasks/calendar" routerLinkActive="active">Calendar</a></li>
              <li><a routerLink="/projects" routerLinkActive="active">Projects</a></li>
            </ul>
          </div>
          
          <div class="nav-section">
            <h2 class="nav-section-title">Analytics</h2>
            <ul class="nav-list">
              <li><a routerLink="/analytics" routerLinkActive="active">Dashboard</a></li>
              <li><a routerLink="/analytics/productivity" routerLinkActive="active">Productivity</a></li>
              <li><a routerLink="/analytics/time-tracking" routerLinkActive="active">Time Tracking</a></li>
              <li><a routerLink="/analytics/reports" routerLinkActive="active">Reports</a></li>
            </ul>
          </div>
          
          <div class="nav-section">
            <h2 class="nav-section-title">Achievements</h2>
            <ul class="nav-list">
              <li><a routerLink="/achievements" routerLinkActive="active">My Achievements</a></li>
              <li><a routerLink="/achievements/leaderboard" routerLinkActive="active">Leaderboard</a></li>
              <li><a routerLink="/achievements/challenges" routerLinkActive="active">Challenges</a></li>
            </ul>
          </div>
          
          <div class="nav-section">
            <h2 class="nav-section-title">Team</h2>
            <ul class="nav-list">
              <li><a routerLink="/team" routerLinkActive="active">Team Dashboard</a></li>
              <li><a routerLink="/team/members" routerLinkActive="active">Members</a></li>
              <li><a routerLink="/team/activity" routerLinkActive="active">Activity</a></li>
            </ul>
          </div>
        </nav>
        
        <div class="sidebar-footer">
          <div class="user-level" *ngIf="userLevel$ | async as level">
            <div class="level-indicator">
              <span class="level-number">{{ level.level }}</span>
            </div>
            <div class="level-progress">
              <div class="level-bar">
                <div class="level-bar-fill" [style.width.%]="level.progress"></div>
              </div>
              <div class="level-text">{{ level.progress | number:'1.0-0' }}% to level {{ level.level + 1 }}</div>
            </div>
          </div>
          
          <div class="user-info" *ngIf="currentUser$ | async as user">
            <img [src]="user.photoURL || 'assets/images/avatar-placeholder.png'" alt="User avatar" class="user-avatar" />
            <div class="user-details">
              <div class="user-name">{{ user.displayName }}</div>
              <a routerLink="/profile" class="user-profile-link">View Profile</a>
            </div>
            <button class="logout-button" (click)="logout()">Logout</button>
          </div>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="main-content">
        <header class="main-header">
          <div class="header-left">
            <button class="menu-toggle">≡</button>
            <div class="search-box">
              <input type="text" placeholder="Search tasks, projects, etc." />
              <button class="search-button">🔍</button>
            </div>
          </div>
          
          <div class="header-right">
            <div class="notifications">
              <button class="notification-button">🔔</button>
            </div>
            <div class="create-new">
              <button class="create-button" (click)="openCreateMenu()">+ Create New</button>
            </div>
          </div>
        </header>
        
        <div class="content-container">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    
    .sidebar {
      width: 260px;
      background-color: #f5f7f9;
      border-right: 1px solid #e1e4e8;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e1e4e8;
    }
    
    .app-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
      margin: 0;
    }
    
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }
    
    .nav-section {
      margin-bottom: 1.5rem;
    }
    
    .nav-section-title {
      padding: 0 1.5rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6c757d;
      margin-bottom: 0.5rem;
    }
    
    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .nav-list li a {
      display: block;
      padding: 0.5rem 1.5rem;
      color: #333;
      text-decoration: none;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }
    
    .nav-list li a:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .nav-list li a.active {
      background-color: rgba(13, 110, 253, 0.1);
      color: #0d6efd;
      font-weight: 500;
    }
    
    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e1e4e8;
    }
    
    .user-level {
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
    }
    
    .level-indicator {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #0d6efd;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 0.75rem;
    }
    
    .level-progress {
      flex: 1;
    }
    
    .level-bar {
      height: 5px;
      background-color: #e9ecef;
      border-radius: 3px;
      margin-bottom: 0.25rem;
    }
    
    .level-bar-fill {
      height: 100%;
      background-color: #0d6efd;
      border-radius: 3px;
    }
    
    .level-text {
      font-size: 0.75rem;
      color: #6c757d;
    }
    
    .user-info {
      display: flex;
      align-items: center;
    }
    
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 0.75rem;
    }
    
    .user-details {
      flex: 1;
    }
    
    .user-name {
      font-weight: 500;
      font-size: 0.875rem;
    }
    
    .user-profile-link {
      font-size: 0.75rem;
      color: #0d6efd;
      text-decoration: none;
    }
    
    .logout-button {
      background: none;
      border: none;
      color: #6c757d;
      font-size: 0.75rem;
      cursor: pointer;
    }
    
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .main-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e1e4e8;
      background-color: white;
    }
    
    .header-left, .header-right {
      display: flex;
      align-items: center;
    }
    
    .menu-toggle {
      background: none;
      border: none;
      font-size: 1.5rem;
      margin-right: 1rem;
      cursor: pointer;
    }
    
    .search-box {
      display: flex;
      align-items: center;
      background-color: #f5f7f9;
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
    }
    
    .search-box input {
      border: none;
      background: none;
      padding: 0.25rem;
      outline: none;
      width: 200px;
    }
    
    .search-button {
      background: none;
      border: none;
      cursor: pointer;
    }
    
    .notifications {
      margin-right: 1rem;
    }
    
    .notification-button {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
    }
    
    .create-button {
      background-color: #0d6efd;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      font-weight: 500;
      cursor: pointer;
    }
    
    .content-container {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      background-color: #f8f9fa;
    }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private gamificationService = inject(GamificationService);
  private router = inject(Router);
  
  currentUser$: Observable<User | null> = this.authService.currentUser;
  
  userLevel$ = this.currentUser$.pipe(
    switchMap(user => {
      if (!user) {
        return of(null);
      }
      const userId = user.id;
      const level = this.gamificationService.getUserLevel(userId);
      const levelProgress = this.gamificationService.getPointsForNextLevel(userId);
      
      const currentPoints = levelProgress.current;
      const requiredPoints = levelProgress.required;
      const progress = Math.min(Math.floor((currentPoints / requiredPoints) * 100), 100);
      
      return of({ level, progress });
    })
  );
  
  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
  
  openCreateMenu() {
    console.log('Opening create menu...');
  }
}