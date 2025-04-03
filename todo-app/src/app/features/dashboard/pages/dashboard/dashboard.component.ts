import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../../core/services/task.service';
import { NotificationService, Notification, NotificationType } from '../../../../core/services/notification.service';
import { GamificationService, Achievement } from '../../../../core/services/gamification.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { Task } from '../../../../core/models/task.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container p-4">
      <h1 class="text-2xl font-bold mb-6">Task Dashboard</h1>
      
      <!-- User Stats Section -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 class="text-xl font-semibold mb-4">Your Stats</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="stat-card bg-blue-50 p-3 rounded-md">
            <h3 class="font-medium text-blue-700">Level</h3>
            <p class="text-2xl font-bold">{{ userLevel }}</p>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div class="bg-blue-600 h-2.5 rounded-full" 
                   [style.width.%]="(levelProgress.current / levelProgress.required) * 100"></div>
            </div>
            <p class="text-sm text-gray-600 mt-1">
              {{ levelProgress.current }} / {{ levelProgress.required }} points to level {{ levelProgress.nextLevel }}
            </p>
          </div>
          <div class="stat-card bg-green-50 p-3 rounded-md">
            <h3 class="font-medium text-green-700">Points</h3>
            <p class="text-2xl font-bold">{{ userPoints }}</p>
          </div>
          <div class="stat-card bg-orange-50 p-3 rounded-md">
            <h3 class="font-medium text-orange-700">Streak</h3>
            <p class="text-2xl font-bold">{{ userStreak }} days</p>
          </div>
        </div>
      </div>

      <!-- Recent Achievements -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6" *ngIf="achievements.length > 0">
        <h2 class="text-xl font-semibold mb-4">Recent Achievements</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div *ngFor="let achievement of achievements" 
               class="achievement-card p-3 rounded-md border border-yellow-200 bg-yellow-50">
            <div class="flex items-center">
              <div class="achievement-icon w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center mr-3">
                <span class="text-yellow-700">🏆</span>
              </div>
              <div>
                <h3 class="font-medium text-yellow-800">{{ achievement.name }}</h3>
                <p class="text-sm text-gray-600">{{ achievement.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Section -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Notifications</h2>
          <button *ngIf="notifications.length > 0" 
                  (click)="markAllAsRead()"
                  class="text-sm text-blue-600 hover:text-blue-800">
            Mark all as read
          </button>
        </div>
        
        <div *ngIf="notifications.length === 0" class="text-gray-500 text-center py-4">
          No notifications yet
        </div>
        
        <div *ngFor="let notification of notifications" 
             class="notification-item p-3 mb-2 rounded-md border-l-4"
             [ngClass]="{
               'border-blue-500 bg-blue-50': notification.type === 'info',
               'border-yellow-500 bg-yellow-50': notification.type === 'warning',
               'border-green-500 bg-green-50': notification.type === 'success',
               'border-red-500 bg-red-50': notification.type === 'error',
               'opacity-60': notification.isRead
             }">
          <div class="flex justify-between">
            <h3 class="font-medium">{{ notification.title }}</h3>
            <span class="text-sm text-gray-500">{{ formatTime(notification.timestamp) }}</span>
          </div>
          <p class="text-sm mt-1">{{ notification.message }}</p>
          <div class="flex justify-end mt-2">
            <button *ngIf="!notification.isRead" 
                    (click)="markAsRead(notification.id)"
                    class="text-xs text-blue-600 hover:text-blue-800 mr-3">
              Mark as read
            </button>
            <button (click)="deleteNotification(notification.id)"
                    class="text-xs text-red-600 hover:text-red-800">
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
        <div *ngIf="activityLog.length === 0" class="text-gray-500 text-center py-4">
          No activity yet
        </div>
        <div *ngFor="let activity of activityLog" class="activity-item p-2 mb-2 border-b">
          <div class="flex justify-between">
            <span class="text-gray-800">{{ activity.action }} task "{{ activity.taskTitle }}"</span>
            <span class="text-sm text-gray-500">{{ formatTime(activity.timestamp) }}</span>
          </div>
        </div>
      </div>

      <!-- Task Management Demo -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 class="text-xl font-semibold mb-4">Try It Out</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Create Task Form -->
          <div class="p-3 border rounded-md">
            <h3 class="font-medium mb-3">Create New Task</h3>
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input 
                type="text" 
                [(ngModel)]="newTaskTitle" 
                class="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task title"
              />
            </div>
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                [(ngModel)]="newTaskDescription" 
                class="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Enter task description"
              ></textarea>
            </div>
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select 
                [(ngModel)]="newTaskPriority" 
                class="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input 
                type="date" 
                [(ngModel)]="newTaskDueDate" 
                class="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button 
              (click)="createTask()" 
              class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
            >
              Create Task
            </button>
          </div>
          
          <!-- Recent Tasks -->
          <div>
            <h3 class="font-medium mb-3">Recent Tasks</h3>
            <div *ngIf="tasks.length === 0" class="text-gray-500 text-center py-4">
              No tasks yet
            </div>
            <div *ngFor="let task of tasks" class="task-item mb-3 p-3 border rounded-md">
              <div class="flex items-center">
                <input 
                  type="checkbox"
                  [checked]="task.completed"
                  (change)="toggleTaskCompletion(task.id)"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <div [ngClass]="{'line-through text-gray-500': task.completed}">
                  <h4 class="font-medium">{{ task.title }}</h4>
                  <p class="text-sm text-gray-600">{{ task.description }}</p>
                  <div class="flex items-center text-xs mt-1">
                    <span 
                      class="px-2 py-1 rounded-full mr-2"
                      [ngClass]="{
                        'bg-green-100 text-green-800': task.priority === 'low',
                        'bg-blue-100 text-blue-800': task.priority === 'medium',
                        'bg-orange-100 text-orange-800': task.priority === 'high',
                        'bg-red-100 text-red-800': task.priority === 'urgent'
                      }"
                    >
                      {{ task.priority }}
                    </span>
                    <span *ngIf="task.dueDate" class="text-gray-500">
                      Due: {{ formatDate(task.dueDate) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // User info
  userId = 'user1'; // Hardcoded for demo
  userLevel = 1;
  userPoints = 0;
  userStreak = 0;
  levelProgress = { current: 0, required: 100, nextLevel: 2 };
  
  // Tasks
  tasks: Task[] = [];
  newTaskTitle = '';
  newTaskDescription = '';
  newTaskPriority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  newTaskDueDate = '';
  
  // Notifications
  notifications: Notification[] = [];
  
  // Achievements
  achievements: Achievement[] = [];
  
  // Activity log
  activityLog: any[] = [];
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private taskService: TaskService,
    private notificationService: NotificationService,
    private gamificationService: GamificationService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    // Load tasks
    this.loadTasks();
    
    // Subscribe to notifications
    const notificationSub = this.notificationService.getNotifications(this.userId)
      .subscribe((notifications: Notification[]) => {
        this.notifications = notifications;
      });
    this.subscriptions.push(notificationSub);
    
    // Load user stats
    this.loadUserStats();
    
    // Load activity log
    this.activityLog = this.analyticsService.getRecentActivity(5);
    
    // Create a welcome notification if user has no notifications
    if (this.notifications.length === 0) {
      this.notificationService.createCustomNotification(
        this.userId,
        'Welcome to Task Manager',
        'Create your first task to get started!',
        NotificationType.INFO
      );
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Load user's tasks
   */
  loadTasks(): void {
    this.taskService.getAllTasks().subscribe((tasks: Task[]) => {
      // In a real app, we'd filter by the current user
      this.tasks = tasks.slice(0, 5); // Show only the 5 most recent tasks for demo
    });
  }

  /**
   * Load user stats from gamification service
   */
  loadUserStats(): void {
    this.userLevel = this.gamificationService.getUserLevel(this.userId);
    this.userPoints = this.gamificationService.getUserPoints(this.userId);
    this.userStreak = this.gamificationService.getUserStreak(this.userId);
    this.levelProgress = this.gamificationService.getPointsForNextLevel(this.userId);
    this.achievements = this.gamificationService.getUserAchievements(this.userId);
  }

  /**
   * Create a new task
   */
  createTask(): void {
    if (!this.newTaskTitle.trim()) {
      return;
    }

    const dueDate = this.newTaskDueDate ? new Date(this.newTaskDueDate).toISOString() : undefined;

    this.taskService.createTask({
      title: this.newTaskTitle,
      description: this.newTaskDescription,
      completed: false,
      priority: this.newTaskPriority,
      dueDate,
      createdBy: this.userId
    }).subscribe((task: Task) => {
      // Refresh the task list
      this.loadTasks();
      
      // Clear the form
      this.newTaskTitle = '';
      this.newTaskDescription = '';
      this.newTaskPriority = 'medium';
      this.newTaskDueDate = '';
      
      // Reload user stats after a short delay to allow observers to process
      setTimeout(() => {
        this.loadUserStats();
        this.activityLog = this.analyticsService.getRecentActivity(5);
      }, 500);
    });
  }

  /**
   * Toggle task completion status
   */
  toggleTaskCompletion(taskId: string): void {
    this.taskService.toggleTaskCompletion(taskId).subscribe(() => {
      // Refresh the task list
      this.loadTasks();
      
      // Reload user stats after a short delay
      setTimeout(() => {
        this.loadUserStats();
        this.activityLog = this.analyticsService.getRecentActivity(5);
      }, 500);
    });
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId, this.userId);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notificationService.markAllAsRead(this.userId);
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string): void {
    this.notificationService.deleteNotification(notificationId, this.userId);
  }

  /**
   * Format a date string for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  /**
   * Format a timestamp for display
   */
  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}