import { Injectable } from '@angular/core';
import { TaskObserver, TaskChangeType } from '../models/task-observer.model';
import { Task } from '../models/task.model';
import { TaskService } from './task.service';

interface TaskActivityLog {
  taskId: string;
  taskTitle: string;
  action: string;
  timestamp: string;
  userId: string;
}

interface TaskMetrics {
  tasksCreated: number;
  tasksCompleted: number;
  tasksDeleted: number;
  averageCompletionTime?: number;
  date?: string;
  week?: string;
  month?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService implements TaskObserver {
  private activityLog: TaskActivityLog[] = [];
  private dailyMetrics: Map<string, TaskMetrics> = new Map();
  private weeklyMetrics: Map<string, TaskMetrics> = new Map();
  private monthlyMetrics: Map<string, TaskMetrics> = new Map();

  constructor(private taskService: TaskService) {
    // Register this service as an observer
    this.taskService.registerObserver(this);
  }

  /**
   * Implementation of TaskObserver update method
   */
  update(task: Task, changeType: TaskChangeType): void {
    const now = new Date();
    const userId = task.createdBy; // For now, using createdBy as userId
    
    // Log the activity
    this.logActivity(task, changeType, userId);
    
    // Update metrics
    this.updateMetrics(task, changeType, now);
  }

  /**
   * Log task activity
   */
  private logActivity(task: Task, changeType: TaskChangeType, userId: string): void {
    let action: string;
    
    switch(changeType) {
      case TaskChangeType.CREATED:
        action = 'created';
        break;
      case TaskChangeType.UPDATED:
        action = 'updated';
        break;
      case TaskChangeType.COMPLETED:
        action = 'completed';
        break;
      case TaskChangeType.DELETED:
        action = 'deleted';
        break;
      case TaskChangeType.DEADLINE_APPROACHING:
        action = 'deadline approaching';
        break;
      case TaskChangeType.ASSIGNED:
        action = 'assigned';
        break;
      case TaskChangeType.COMMENT_ADDED:
        action = 'comment added';
        break;
      case TaskChangeType.SUBTASK_ADDED:
        action = 'subtask added';
        break;
      case TaskChangeType.SUBTASK_COMPLETED:
        action = 'subtask completed';
        break;
      case TaskChangeType.SUBTASK_DELETED:
        action = 'subtask deleted';
        break;
      default:
        action = 'unknown action';
    }
    
    const activityEntry: TaskActivityLog = {
      taskId: task.id,
      taskTitle: task.title,
      action,
      timestamp: new Date().toISOString(),
      userId
    };
    
    this.activityLog.push(activityEntry);
    
    // For a real app, we'd store this in a database or send to an analytics service
    console.log(`Analytics logged: ${userId} ${action} task "${task.title}"`);
  }

  /**
   * Update metrics based on task changes
   */
  private updateMetrics(task: Task, changeType: TaskChangeType, date: Date): void {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const weekStr = this.getWeekIdentifier(date);
    const monthStr = dateStr.substring(0, 7); // YYYY-MM
    
    // Update daily metrics
    this.updateMetricsForPeriod(this.dailyMetrics, dateStr, task, changeType);
    
    // Update weekly metrics
    this.updateMetricsForPeriod(this.weeklyMetrics, weekStr, task, changeType);
    
    // Update monthly metrics
    this.updateMetricsForPeriod(this.monthlyMetrics, monthStr, task, changeType);
  }

  /**
   * Update metrics for a specific time period
   */
  private updateMetricsForPeriod(
    metricsMap: Map<string, TaskMetrics>, 
    periodKey: string, 
    task: Task, 
    changeType: TaskChangeType
  ): void {
    let metrics = metricsMap.get(periodKey) || {
      tasksCreated: 0,
      tasksCompleted: 0,
      tasksDeleted: 0
    };
    
    switch(changeType) {
      case TaskChangeType.CREATED:
        metrics.tasksCreated++;
        break;
      case TaskChangeType.COMPLETED:
        metrics.tasksCompleted++;
        // Here we could calculate completion time if we had the creation time
        break;
      case TaskChangeType.DELETED:
        metrics.tasksDeleted++;
        break;
    }
    
    metricsMap.set(periodKey, metrics);
  }

  /**
   * Helper to get a week identifier string (YYYY-WW)
   */
  private getWeekIdentifier(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); // Thursday in current week
    const week1 = new Date(d.getFullYear(), 0, 4); // January 4th
    const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
  }

  /**
   * Get recent activity log
   */
  getRecentActivity(limit: number = 50): TaskActivityLog[] {
    return [...this.activityLog]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get daily metrics for a specific day or range
   */
  getDailyMetrics(date?: string, endDate?: string): TaskMetrics[] {
    if (!date) {
      // Return all daily metrics
      return Array.from(this.dailyMetrics.entries())
        .sort((a, b) => b[0].localeCompare(a[0])) // Sort by date descending
        .map(([date, metrics]) => ({ date, ...metrics }));
    } else if (!endDate) {
      // Return metrics for a specific day
      const metrics = this.dailyMetrics.get(date);
      return metrics ? [{ date, ...metrics }] : [];
    } else {
      // Return metrics for a date range
      return Array.from(this.dailyMetrics.entries())
        .filter(([d]) => d >= date && d <= endDate)
        .sort((a, b) => a[0].localeCompare(b[0])) // Sort by date ascending
        .map(([date, metrics]) => ({ date, ...metrics }));
    }
  }

  /**
   * Get weekly metrics
   */
  getWeeklyMetrics(weekIdentifier?: string): TaskMetrics[] {
    if (!weekIdentifier) {
      // Return all weekly metrics
      return Array.from(this.weeklyMetrics.entries())
        .sort((a, b) => b[0].localeCompare(a[0])) // Sort by week descending
        .map(([week, metrics]) => ({ week, ...metrics }));
    } else {
      // Return metrics for a specific week
      const metrics = this.weeklyMetrics.get(weekIdentifier);
      return metrics ? [{ week: weekIdentifier, ...metrics }] : [];
    }
  }

  /**
   * Get monthly metrics
   */
  getMonthlyMetrics(monthIdentifier?: string): TaskMetrics[] {
    if (!monthIdentifier) {
      // Return all monthly metrics
      return Array.from(this.monthlyMetrics.entries())
        .sort((a, b) => b[0].localeCompare(a[0])) // Sort by month descending
        .map(([month, metrics]) => ({ month, ...metrics }));
    } else {
      // Return metrics for a specific month
      const metrics = this.monthlyMetrics.get(monthIdentifier);
      return metrics ? [{ month: monthIdentifier, ...metrics }] : [];
    }
  }

  /**
   * Calculate task completion rate
   */
  getCompletionRate(period: 'day' | 'week' | 'month', identifier?: string): number {
    let metrics: TaskMetrics | undefined;
    
    switch(period) {
      case 'day':
        metrics = this.dailyMetrics.get(identifier || new Date().toISOString().split('T')[0]);
        break;
      case 'week':
        metrics = this.weeklyMetrics.get(identifier || this.getWeekIdentifier(new Date()));
        break;
      case 'month':
        metrics = this.monthlyMetrics.get(identifier || new Date().toISOString().substring(0, 7));
        break;
    }
    
    if (!metrics || metrics.tasksCreated === 0) return 0;
    
    return (metrics.tasksCompleted / metrics.tasksCreated) * 100;
  }

  /**
   * Get productivity score based on task completion and other factors
   */
  getProductivityScore(userId: string, days: number = 7): number {
    // Simple productivity score calculation based on completion rate
    // In a real app, this would be more sophisticated
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);
    
    let totalCreated = 0;
    let totalCompleted = 0;
    
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const metrics = this.dailyMetrics.get(dateStr);
      
      if (metrics) {
        totalCreated += metrics.tasksCreated;
        totalCompleted += metrics.tasksCompleted;
      }
    }
    
    if (totalCreated === 0) return 0;
    
    // Base score on completion percentage, scale from 0-100
    return (totalCompleted / totalCreated) * 100;
  }
}