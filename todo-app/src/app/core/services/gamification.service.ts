import { Injectable } from '@angular/core';
import { TaskObserver, TaskChangeType } from '../models/task-observer.model';
import { Task } from '../models/task.model';
import { TaskService } from './task.service';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt?: string;
}

export interface UserProgress {
  userId: string;
  points: number;
  level: number;
  achievements: Achievement[];
  streakDays: number;
  lastActivityDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GamificationService implements TaskObserver {
  private userProgress: Map<string, UserProgress> = new Map();
  
  // Define achievements
  private availableAchievements: Achievement[] = [
    {
      id: 'first-task',
      name: 'First Steps',
      description: 'Create your first task',
      iconUrl: 'assets/badges/first-task.svg'
    },
    {
      id: 'task-master',
      name: 'Task Master',
      description: 'Complete 10 tasks',
      iconUrl: 'assets/badges/task-master.svg'
    },
    {
      id: 'streak-3',
      name: 'On Fire',
      description: 'Complete tasks for 3 days in a row',
      iconUrl: 'assets/badges/streak-3.svg'
    },
    {
      id: 'streak-7',
      name: 'Unstoppable',
      description: 'Complete tasks for 7 days in a row',
      iconUrl: 'assets/badges/streak-7.svg'
    },
    {
      id: 'organization-pro',
      name: 'Organization Pro',
      description: 'Create 5 tasks with subtasks',
      iconUrl: 'assets/badges/organization-pro.svg'
    },
    {
      id: 'deadline-crusher',
      name: 'Deadline Crusher',
      description: 'Complete 5 tasks before their deadline',
      iconUrl: 'assets/badges/deadline-crusher.svg'
    }
  ];

  // Define the points system
  private readonly POINTS = {
    TASK_CREATED: 5,
    TASK_COMPLETED: 10,
    SUBTASK_CREATED: 2,
    SUBTASK_COMPLETED: 3,
    DEADLINE_MET: 15,   // Bonus points for completing before deadline
    STREAK_BONUS: 5     // Points per day in streak
  };

  // Define leveling system
  private readonly LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    1000,   // Level 5
    2000,   // Level 6
    3500,   // Level 7
    5000,   // Level 8
    7500,   // Level 9
    10000   // Level 10
  ];

  constructor(private taskService: TaskService) {
    // Register this service as an observer
    this.taskService.registerObserver(this);
  }

  /**
   * Implementation of TaskObserver update method
   */
  update(task: Task, changeType: TaskChangeType): void {
    const userId = task.createdBy; // For now, we use createdBy as userId
    
    // Initialize user progress if it doesn't exist
    if (!this.userProgress.has(userId)) {
      this.initializeUserProgress(userId);
    }
    
    // Handle different task changes
    switch (changeType) {
      case TaskChangeType.CREATED:
        this.handleTaskCreated(userId, task);
        break;
      case TaskChangeType.COMPLETED:
        this.handleTaskCompleted(userId, task);
        break;
      case TaskChangeType.SUBTASK_ADDED:
        this.handleSubtaskAdded(userId, task);
        break;
      case TaskChangeType.SUBTASK_COMPLETED:
        this.handleSubtaskCompleted(userId, task);
        break;
    }
    
    // Update user's last activity date and check for streaks
    this.updateLastActivity(userId);
  }

  /**
   * Initialize a new user's progress
   */
  private initializeUserProgress(userId: string): void {
    this.userProgress.set(userId, {
      userId,
      points: 0,
      level: 1,
      achievements: [],
      streakDays: 0
    });
  }

  /**
   * Handle task creation
   */
  private handleTaskCreated(userId: string, task: Task): void {
    const progress = this.userProgress.get(userId)!;
    
    // Award points
    this.addPoints(userId, this.POINTS.TASK_CREATED);
    
    // Check for "First Task" achievement
    if (progress.achievements.length === 0) {
      this.awardAchievement(userId, 'first-task');
    }
  }

  /**
   * Handle task completion
   */
  private handleTaskCompleted(userId: string, task: Task): void {
    // Award points for task completion
    this.addPoints(userId, this.POINTS.TASK_COMPLETED);
    
    // Check if completed before deadline for bonus points
    if (task.dueDate && new Date(task.dueDate) > new Date()) {
      this.addPoints(userId, this.POINTS.DEADLINE_MET);
      
      // Track deadline achievements
      this.trackDeadlineCompletion(userId);
    }
    
    // Check for Task Master achievement
    this.trackTaskCompletions(userId);
  }

  /**
   * Handle subtask creation
   */
  private handleSubtaskAdded(userId: string, task: Task): void {
    this.addPoints(userId, this.POINTS.SUBTASK_CREATED);
    
    // Track tasks with subtasks for Organization Pro achievement
    this.trackTasksWithSubtasks(userId, task);
  }

  /**
   * Handle subtask completion
   */
  private handleSubtaskCompleted(userId: string, task: Task): void {
    this.addPoints(userId, this.POINTS.SUBTASK_COMPLETED);
  }

  /**
   * Update user's last activity date and check for streaks
   */
  private updateLastActivity(userId: string): void {
    const progress = this.userProgress.get(userId)!;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (progress.lastActivityDate === today) {
      // Already recorded activity for today
      return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (progress.lastActivityDate === yesterdayStr) {
      // Continuing a streak
      progress.streakDays++;
      
      // Award streak achievements
      if (progress.streakDays === 3) {
        this.awardAchievement(userId, 'streak-3');
      } else if (progress.streakDays === 7) {
        this.awardAchievement(userId, 'streak-7');
      }
      
      // Award streak bonus points
      this.addPoints(userId, this.POINTS.STREAK_BONUS);
    } else if (!progress.lastActivityDate || progress.lastActivityDate < yesterdayStr) {
      // Streak broken or first activity
      progress.streakDays = 1;
    }
    
    progress.lastActivityDate = today;
    this.userProgress.set(userId, progress);
  }

  /**
   * Add points to a user and check for level ups
   */
  private addPoints(userId: string, points: number): void {
    const progress = this.userProgress.get(userId)!;
    
    // Add points
    progress.points += points;
    
    // Check for level up
    const newLevel = this.calculateLevel(progress.points);
    
    if (newLevel > progress.level) {
      // Level up!
      progress.level = newLevel;
      console.log(`User ${userId} leveled up to level ${newLevel}!`);
    }
    
    this.userProgress.set(userId, progress);
  }

  /**
   * Calculate user level based on points
   */
  private calculateLevel(points: number): number {
    for (let i = this.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= this.LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1; // Default level
  }

  /**
   * Award an achievement to a user
   */
  private awardAchievement(userId: string, achievementId: string): void {
    const progress = this.userProgress.get(userId)!;
    
    // Check if user already has this achievement
    if (progress.achievements.some(a => a.id === achievementId)) {
      return;
    }
    
    // Find the achievement
    const achievement = this.availableAchievements.find(a => a.id === achievementId);
    
    if (achievement) {
      // Award it with current timestamp
      const awardedAchievement = {
        ...achievement,
        unlockedAt: new Date().toISOString()
      };
      
      progress.achievements.push(awardedAchievement);
      this.userProgress.set(userId, progress);
      
      console.log(`User ${userId} earned achievement: ${achievement.name}`);
    }
  }

  /**
   * Track task completions for Task Master achievement
   */
  private trackTaskCompletions(userId: string): void {
    // In a real app, we'd query the number of completed tasks from a database
    // For this example, we'll just maintain a simple count based on events
    
    // Let's award Task Master achievement after 10 completions
    const progress = this.userProgress.get(userId)!;
    
    // Count completed tasks (for demo purposes we'll estimate based on points)
    const estimatedCompletions = Math.floor(progress.points / this.POINTS.TASK_COMPLETED);
    
    if (estimatedCompletions >= 10 && 
        !progress.achievements.some(a => a.id === 'task-master')) {
      this.awardAchievement(userId, 'task-master');
    }
  }

  /**
   * Track deadline completions for Deadline Crusher achievement
   */
  private trackDeadlineCompletion(userId: string): void {
    // Similar to task completions, we're estimating for demo purposes
    const progress = this.userProgress.get(userId)!;
    
    // Estimate deadline completions based on points
    const pointsFromDeadlines = progress.points - 
      (progress.achievements.length * 50); // Rough estimate accounting for achievement bonuses
    
    const estimatedDeadlineCompletions = Math.floor(pointsFromDeadlines / this.POINTS.DEADLINE_MET);
    
    if (estimatedDeadlineCompletions >= 5 && 
        !progress.achievements.some(a => a.id === 'deadline-crusher')) {
      this.awardAchievement(userId, 'deadline-crusher');
    }
  }

  /**
   * Track tasks with subtasks for Organization Pro achievement
   */
  private trackTasksWithSubtasks(userId: string, task: Task): void {
    // For a real app, we'd query the database
    // For this example, we'll count any task that has at least 3 subtasks
    
    if (task.subtasks && task.subtasks.length >= 3) {
      const progress = this.userProgress.get(userId)!;
      
      // Estimate number of well-organized tasks
      const estimatedOrganizedTasks = Math.floor(progress.points / (this.POINTS.SUBTASK_CREATED * 3));
      
      if (estimatedOrganizedTasks >= 5 && 
          !progress.achievements.some(a => a.id === 'organization-pro')) {
        this.awardAchievement(userId, 'organization-pro');
      }
    }
  }

  /**
   * Get user progress
   */
  getUserProgress(userId: string): UserProgress | undefined {
    return this.userProgress.get(userId);
  }

  /**
   * Get user achievements
   */
  getUserAchievements(userId: string): Achievement[] {
    const progress = this.userProgress.get(userId);
    return progress ? progress.achievements : [];
  }

  /**
   * Get user streak
   */
  getUserStreak(userId: string): number {
    const progress = this.userProgress.get(userId);
    return progress ? progress.streakDays : 0;
  }

  /**
   * Get user level
   */
  getUserLevel(userId: string): number {
    const progress = this.userProgress.get(userId);
    return progress ? progress.level : 1;
  }

  /**
   * Get user points
   */
  getUserPoints(userId: string): number {
    const progress = this.userProgress.get(userId);
    return progress ? progress.points : 0;
  }

  /**
   * Get all available achievements (including lock status for a user)
   */
  getAllAchievements(userId: string): Achievement[] {
    const userProgress = this.userProgress.get(userId);
    
    if (!userProgress) {
      return this.availableAchievements;
    }
    
    return this.availableAchievements.map(achievement => {
      const userAchievement = userProgress.achievements.find(a => a.id === achievement.id);
      return userAchievement || achievement;
    });
  }

  /**
   * Get points needed for next level
   */
  getPointsForNextLevel(userId: string): {current: number, required: number, nextLevel: number} {
    const progress = this.userProgress.get(userId);
    
    if (!progress) {
      return { current: 0, required: this.LEVEL_THRESHOLDS[0], nextLevel: 2 };
    }
    
    const currentLevel = progress.level;
    
    if (currentLevel >= this.LEVEL_THRESHOLDS.length) {
      // Max level reached
      return { 
        current: progress.points, 
        required: progress.points, 
        nextLevel: currentLevel 
      };
    }
    
    return {
      current: progress.points,
      required: this.LEVEL_THRESHOLDS[currentLevel],
      nextLevel: currentLevel + 1
    };
  }
}