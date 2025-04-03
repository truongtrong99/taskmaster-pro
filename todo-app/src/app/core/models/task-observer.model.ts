import { Task } from './task.model';

/**
 * Types of task changes that can occur in the system
 */
export enum TaskChangeType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  COMPLETED = 'COMPLETED',
  DELETED = 'DELETED',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  ASSIGNED = 'ASSIGNED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  SUBTASK_ADDED = 'SUBTASK_ADDED',
  SUBTASK_COMPLETED = 'SUBTASK_COMPLETED',
  SUBTASK_DELETED = 'SUBTASK_DELETED'
}

/**
 * Observer interface for task updates
 */
export interface TaskObserver {
  update(task: Task, changeType: TaskChangeType): void;
}

/**
 * Subject interface for the observer pattern
 */
export interface TaskSubject {
  registerObserver(observer: TaskObserver): void;
  removeObserver(observer: TaskObserver): void;
  notifyObservers(task: Task, changeType: TaskChangeType): void;
}