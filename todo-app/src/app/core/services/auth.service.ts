import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { 
  AuthProvider, 
  User, 
  AuthRequest, 
  AuthResponse, 
  RegistrationRequest, 
  PasswordResetRequest,
  UserPreferences,
  UserStats,
  Achievement
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser: Observable<User | null> = this.currentUserSubject.asObservable();
  
  // Mock user storage - to be replaced with real backend API calls
  private mockUsers: User[] = [];
  private mockTokens: { [userId: string]: string } = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize with mock data
    this.initializeMockData();
    
    // Check for stored authentication in localStorage
    this.loadUserFromStorage();
  }

  // Authentication methods
  login(authRequest: AuthRequest): Observable<AuthResponse> {
    const { email, password } = authRequest;
    const user = this.mockUsers.find(u => u.email === email);

    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    // In a real implementation, this would verify password hash
    
    // Create auth tokens
    const token = this.generateToken();
    const refreshToken = this.generateToken();
    this.mockTokens[user.id] = token;

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Update the user in storage
    this.storeUserAndToken(user, token, refreshToken);
    
    // Update the current user
    this.currentUserSubject.next(user);

    return of({
      user,
      token,
      refreshToken,
      expiresIn: 3600 // 1 hour
    }).pipe(delay(500)); // Simulate API delay
  }

  register(request: RegistrationRequest): Observable<User> {
    const { email, password, displayName, authProvider } = request;
    
    // Check if user already exists
    if (this.mockUsers.find(u => u.email === email)) {
      return throwError(() => new Error('User already exists'));
    }

    // Create new user with default settings
    const newUser: User = {
      id: this.generateId(),
      email,
      displayName,
      profile: {
        firstName: displayName.split(' ')[0],
        lastName: displayName.split(' ').slice(1).join(' '),
        displayName
      },
      roles: ['user'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: false,
      twoFactorEnabled: false,
      preferences: this.getDefaultPreferences(),
      stats: this.getDefaultStats(),
      achievements: [],
      points: 0
    };

    // In a real implementation, this would hash password and store it

    // Add to mock users
    this.mockUsers.push(newUser);

    return of(newUser).pipe(delay(800)); // Simulate API delay
  }

  logout(): Observable<boolean> {
    // Clear stored user data
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    
    // Update current user state
    this.currentUserSubject.next(null);
    
    return of(true).pipe(delay(300)); // Simulate API delay
  }

  resetPassword(request: PasswordResetRequest): Observable<boolean> {
    const { email } = request;
    
    const user = this.mockUsers.find(u => u.email === email);
    if (!user) {
      // In a real implementation, we wouldn't reveal if a user exists or not
      // for security reasons, but would always return success
      return of(true).pipe(delay(800));
    }

    // In a real implementation, this would send a password reset email

    return of(true).pipe(delay(800)); // Simulate API delay
  }

  verifyEmail(token: string): Observable<boolean> {
    const currentUser = this.currentUserSubject.getValue();
    
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    // In a real implementation, this would verify the token

    // Update user
    currentUser.emailVerified = true;
    this.currentUserSubject.next(currentUser);

    // Update stored user
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    return of(true).pipe(delay(500)); // Simulate API delay
  }

  enableTwoFactor(): Observable<boolean> {
    const currentUser = this.currentUserSubject.getValue();
    
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    // In a real implementation, this would generate 2FA setup

    // Update user
    currentUser.twoFactorEnabled = true;
    this.currentUserSubject.next(currentUser);

    // Update stored user
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    return of(true).pipe(delay(800)); // Simulate API delay
  }

  // User profile methods
  updateProfile(updates: Partial<User>): Observable<User> {
    const currentUser = this.currentUserSubject.getValue();
    
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    // Update user
    const updatedUser = {
      ...currentUser,
      ...updates
    };

    this.currentUserSubject.next(updatedUser);

    // Update stored user
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    // Update mock users
    const index = this.mockUsers.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
      this.mockUsers[index] = updatedUser;
    }

    return of(updatedUser).pipe(delay(500)); // Simulate API delay
  }

  updatePreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    const currentUser = this.currentUserSubject.getValue();
    
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    // Make sure current user has preferences initialized
    if (!currentUser.preferences) {
      currentUser.preferences = this.getDefaultPreferences();
    }

    // Update preferences ensuring all required properties are present
    const updatedPreferences: UserPreferences = {
      ...currentUser.preferences,
      ...preferences
    };

    // Update user
    currentUser.preferences = updatedPreferences;
    this.currentUserSubject.next({ ...currentUser });

    // Update stored user
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    return of(updatedPreferences).pipe(delay(300)); // Simulate API delay
  }

  // Social authentication methods
  loginWithProvider(provider: AuthProvider): Observable<AuthResponse> {
    // In a real implementation, this would redirect to the provider's auth page
    // or use a library like firebase auth
    
    // For mock purposes, create a mock social user
    const email = `user.${provider.toLowerCase()}@example.com`;
    let user = this.mockUsers.find(u => u.email === email);
    
    if (!user) {
      // Create mock user for this provider
      user = {
        id: this.generateId(),
        email,
        displayName: `${provider} User`,
        photoURL: 'https://via.placeholder.com/150',
        profile: {
          firstName: provider,
          lastName: 'User',
          displayName: `${provider} User`,
          photoURL: 'https://via.placeholder.com/150'
        },
        roles: ['user'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true, // Social auth users are typically pre-verified
        twoFactorEnabled: false,
        preferences: this.getDefaultPreferences(),
        stats: this.getDefaultStats(),
        achievements: [],
        points: 0
      };
      
      this.mockUsers.push(user);
    }

    // Create auth tokens
    const token = this.generateToken();
    const refreshToken = this.generateToken();
    
    if (user) {
      this.mockTokens[user.id] = token;
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      
      // Store user and token
      this.storeUserAndToken(user, token, refreshToken);
      
      // Update current user
      this.currentUserSubject.next(user);
    }

    return of({
      user: user as User, // We've checked user exists above
      token,
      refreshToken,
      expiresIn: 3600 // 1 hour
    }).pipe(delay(1000)); // Simulate API delay
  }

  // Achievement methods
  addAchievement(achievement: Achievement): Observable<Achievement[]> {
    const currentUser = this.currentUserSubject.getValue();
    
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    // Add achievement if not already earned
    if (!currentUser.achievements.some(a => a.id === achievement.id)) {
      currentUser.achievements.push(achievement);
      currentUser.points += achievement.points;
      
      // Update user
      this.currentUserSubject.next({ ...currentUser });
      
      // Update stored user
      if (isPlatformBrowser(this.platformId) && localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    }

    return of(currentUser.achievements).pipe(delay(300));
  }

  // Stats methods
  updateStats(updates: Partial<UserStats>): Observable<UserStats> {
    const currentUser = this.currentUserSubject.getValue();
    
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    // Update stats
    const updatedStats = {
      ...currentUser.stats,
      ...updates
    };

    // Update user
    currentUser.stats = updatedStats;
    this.currentUserSubject.next({ ...currentUser });

    // Update stored user
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    return of(updatedStats).pipe(delay(300));
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.getValue();
  }

  private loadUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
        } catch (e) {
          localStorage.removeItem('currentUser');
        }
      }
    }
  }

  private storeUserAndToken(user: User, token: string, refreshToken: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private generateId(): string {
    return 'user-' + Math.random().toString(36).substring(2, 11);
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      emailNotifications: true,
      pushNotifications: true, 
      defaultTaskView: 'list',
      defaultPriority: 'medium',
      theme: 'system'
    };
  }

  private getDefaultStats(): UserStats {
    return {
      tasksCompleted: 0,
      tasksByPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      },
      streakDays: 0,
      longestStreak: 0,
      productivityByDay: {},
      productivityByHour: {},
      weeklyCompletion: 0
    };
  }

  private initializeMockData(): void {
    // Create mock users
    this.mockUsers = [
      {
        id: 'user-1',
        email: 'admin@example.com',
        displayName: 'Admin User',
        photoURL: 'https://via.placeholder.com/150',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          displayName: 'Admin User',
          photoURL: 'https://via.placeholder.com/150'
        },
        roles: ['admin', 'user'],
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
        lastLogin: new Date('2025-04-02').toISOString(),
        emailVerified: true,
        twoFactorEnabled: false,
        preferences: this.getDefaultPreferences(),
        stats: {
          ...this.getDefaultStats(),
          tasksCompleted: 42,
          streakDays: 7,
          longestStreak: 14
        },
        achievements: [
          {
            id: 'first-task',
            name: 'First Task',
            description: 'Complete your first task',
            icon: '✅',
            dateEarned: new Date('2025-01-02'),
            points: 10
          }
        ],
        points: 10
      },
      {
        id: 'user-2',
        email: 'user@example.com',
        displayName: 'Regular User',
        profile: {
          firstName: 'Regular',
          lastName: 'User',
          displayName: 'Regular User'
        },
        roles: ['user'],
        createdAt: new Date('2025-02-15').toISOString(),
        updatedAt: new Date('2025-02-15').toISOString(),
        lastLogin: new Date('2025-04-01').toISOString(),
        emailVerified: true,
        twoFactorEnabled: false,
        preferences: this.getDefaultPreferences(),
        stats: this.getDefaultStats(),
        achievements: [],
        points: 0
      }
    ];
  }
}