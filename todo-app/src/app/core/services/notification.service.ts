import { Injectable } from '@angular/core';
import { TaskObserver, TaskChangeType } from '../models/task-observer.model';
import { Task } from '../models/task.model';
import { TaskService } from './task.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  title: string;
  message: string;
  taskId?: string;
  userId: string;
  timestamp: string;
  isRead: boolean;
  type: NotificationType;
}

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error'
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements TaskObserver {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);

  constructor(private taskService: TaskService) {
    // Register this service as an observer
    this.taskService.registerObserver(this);
  }

  /**
   * Implementation of TaskObserver update method
   */
  update(task: Task, changeType: TaskChangeType): void {
    switch (changeType) {
      case TaskChangeType.DEADLINE_APPROACHING:
        this.createDeadlineNotification(task);
        break;
      case TaskChangeType.COMPLETED:
        this.createCompletionNotification(task);
        break;
      case TaskChangeType.ASSIGNED:
        this.createAssignmentNotification(task);
        break;
      case TaskChangeType.COMMENT_ADDED:
        this.createCommentNotification(task);
        break;
    }
  }

  /**
   * Create a deadline approaching notification
   */
  private createDeadlineNotification(task: Task): void {
    const message = `Task "${task.title}" is due soon.`;
    this.addNotification({
      id: `deadline-${task.id}-${Date.now()}`,
      title: 'Deadline Approaching',
      message,
      taskId: task.id,
      userId: task.createdBy, // In a real app, this would be the assigned user
      timestamp: new Date().toISOString(),
      isRead: false,
      type: NotificationType.WARNING
    });
  }

  /**
   * Create a task completion notification
   */
  private createCompletionNotification(task: Task): void {
    const message = `Task "${task.title}" has been completed.`;
    this.addNotification({
      id: `completion-${task.id}-${Date.now()}`,
      title: 'Task Completed',
      message,
      taskId: task.id,
      userId: task.createdBy, // In a real app, might notify task creator or project members
      timestamp: new Date().toISOString(),
      isRead: false,
      type: NotificationType.SUCCESS
    });
  }

  /**
   * Create a task assignment notification
   */
  private createAssignmentNotification(task: Task): void {
    const message = `You have been assigned to task "${task.title}".`;
    this.addNotification({
      id: `assignment-${task.id}-${Date.now()}`,
      title: 'New Task Assignment',
      message,
      taskId: task.id,
      userId: task.createdBy, // In a real app, this would be the assigned user
      timestamp: new Date().toISOString(),
      isRead: false,
      type: NotificationType.INFO
    });
  }

  /**
   * Create a comment notification
   */
  private createCommentNotification(task: Task): void {
    const message = `New comment on task "${task.title}".`;
    this.addNotification({
      id: `comment-${task.id}-${Date.now()}`,
      title: 'New Comment',
      message,
      taskId: task.id,
      userId: task.createdBy, // In a real app, would notify other participants
      timestamp: new Date().toISOString(),
      isRead: false,
      type: NotificationType.INFO
    });
  }

  /**
   * Create a custom notification
   */
  createCustomNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    taskId?: string
  ): Notification {
    const notification: Notification = {
      id: `custom-${Date.now()}`,
      title,
      message,
      userId,
      taskId,
      timestamp: new Date().toISOString(),
      isRead: false,
      type
    };
    
    this.addNotification(notification);
    return notification;
  }

  /**
   * Add a notification to the list
   */
  private addNotification(notification: Notification): void {
    this.notifications.unshift(notification);
    
    // Limit the number of stored notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
    
    // Update observables
    this.notificationsSubject.next([...this.notifications]);
    this.updateUnreadCount();
  }

  /**
   * Get all notifications for a user
   */
  getNotifications(userId: string): Observable<Notification[]> {
    // Filter notifications by user and update the subject
    const userNotifications = this.notifications.filter(n => n.userId === userId);
    this.notificationsSubject.next(userNotifications);
    return this.notificationsSubject.asObservable();
  }

  /**
   * Get count of unread notifications for a user
   */
  getUnreadCount(userId: string): Observable<number> {
    // Update unread count for this user
    this.updateUnreadCount(userId);
    return this.unreadCount.asObservable();
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: string, userId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId && n.userId === userId);
    
    if (notification) {
      notification.isRead = true;
      this.notificationsSubject.next([...this.notifications]);
      this.updateUnreadCount(userId);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead(userId: string): void {
    let updated = false;
    
    this.notifications.forEach(notification => {
      if (notification.userId === userId && !notification.isRead) {
        notification.isRead = true;
        updated = true;
      }
    });
    
    if (updated) {
      this.notificationsSubject.next([...this.notifications]);
      this.updateUnreadCount(userId);
    }
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string, userId: string): void {
    const initialLength = this.notifications.length;
    this.notifications = this.notifications.filter(
      n => !(n.id === notificationId && n.userId === userId)
    );
    
    if (initialLength !== this.notifications.length) {
      this.notificationsSubject.next([...this.notifications]);
      this.updateUnreadCount(userId);
    }
  }

  /**
   * Clear all notifications for a user
   */
  clearAllNotifications(userId: string): void {
    const initialLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.userId !== userId);
    
    if (initialLength !== this.notifications.length) {
      this.notificationsSubject.next([...this.notifications]);
      this.updateUnreadCount(userId);
    }
  }

  /**
   * Update the unread count
   */
  private updateUnreadCount(userId?: string): void {
    if (userId) {
      const count = this.notifications.filter(n => n.userId === userId && !n.isRead).length;
      this.unreadCount.next(count);
    } else {
      // If no userId provided, just update based on all unread notifications
      const count = this.notifications.filter(n => !n.isRead).length;
      this.unreadCount.next(count);
    }
  }
}