// User model for the Todo application

// Authentication provider types
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  GITHUB = 'github',
  MICROSOFT = 'microsoft'
}

// User profile model
export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  jobTitle?: string;
  department?: string;
  timezone?: string;
  theme?: 'light' | 'dark' | 'system';
  displayName?: string;
  photoURL?: string;
}

// User preferences model
export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  defaultTaskView: 'list' | 'board' | 'calendar';
  defaultPriority: 'low' | 'medium' | 'high';
  theme?: 'light' | 'dark' | 'system';
}

// User stats and tracking
export interface UserStats {
  tasksCompleted: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  streakDays: number; // Current streak of days with completed tasks
  longestStreak: number;
  productivityByDay: { [key: string]: number }; // Day of week -> productivity score
  productivityByHour: { [key: string]: number }; // Hour of day -> productivity score
  weeklyGoal?: number;
  weeklyCompletion: number;
}

// User achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateEarned: Date;
  points: number;
}

// User profile
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  roles: string[];
  createdAt: string; // Stored as ISO string
  updatedAt: string; // Stored as ISO string
  lastLogin?: string; // Stored as ISO string
  preferences?: UserPreferences;
  stats: UserStats;
  achievements: Achievement[];
  points: number;
  teams?: string[]; // IDs of teams the user belongs to
  emailVerified?: boolean; // Added missing property
  twoFactorEnabled?: boolean; // Added missing property
  photoURL?: string; // Direct access for convenience
  displayName?: string; // Direct access for convenience
}

// User authentication related interfaces
export interface AuthRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegistrationRequest {
  email: string;
  password: string;
  displayName: string;
  authProvider?: AuthProvider;
}

export interface PasswordResetRequest {
  email: string;
}
