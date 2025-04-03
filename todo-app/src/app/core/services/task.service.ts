import { Injectable } from '@angular/core';
import { Observable, of, delay, Subject } from 'rxjs';
import { Task, Priority, SubTask } from '../models/task.model';
import { TaskObserver, TaskSubject, TaskChangeType } from '../models/task-observer.model';

// Mock data for development purposes
const MOCK_TASKS: Task[] = [
  {
    id: 'task1',
    title: 'Complete project proposal',
    description: 'Finish the Q2 project proposal for client review',
    completed: false,
    createdAt: '2025-03-30T10:00:00Z',
    updatedAt: '2025-03-30T10:00:00Z',
    dueDate: '2025-04-05T23:59:59Z',
    priority: 'high',
    project: 'project1',
    tags: ['proposal', 'client', 'deadline'],
    subtasks: [
      { id: 'sub1', title: 'Research market trends', completed: true },
      { id: 'sub2', title: 'Draft executive summary', completed: true },
      { id: 'sub3', title: 'Prepare budget estimates', completed: false },
      { id: 'sub4', title: 'Create timeline', completed: false }
    ],
    createdBy: 'user1'
  },
  {
    id: 'task2',
    title: 'Schedule team meeting',
    description: 'Arrange weekly team sync meeting for project updates',
    completed: true,
    createdAt: '2025-03-29T09:00:00Z',
    updatedAt: '2025-03-30T15:30:00Z',
    priority: 'medium',
    project: 'project1',
    tags: ['meeting', 'team', 'recurring'],
    createdBy: 'user1'
  },
  {
    id: 'task3',
    title: 'Review content strategy',
    description: 'Evaluate current content performance and recommend improvements',
    completed: false,
    createdAt: '2025-03-28T14:00:00Z',
    updatedAt: '2025-03-28T14:00:00Z',
    dueDate: '2025-04-10T23:59:59Z',
    priority: 'medium',
    project: 'project2',
    tags: ['marketing', 'content', 'analytics'],
    createdBy: 'user1'
  },
  {
    id: 'task4',
    title: 'Fix navigation bug in mobile view',
    description: 'Address issue with hamburger menu not displaying correctly on iOS devices',
    completed: false,
    createdAt: '2025-03-31T08:30:00Z',
    updatedAt: '2025-03-31T08:30:00Z',
    dueDate: '2025-04-02T23:59:59Z',
    priority: 'urgent',
    project: 'project3',
    tags: ['bug', 'mobile', 'UI/UX'],
    createdBy: 'user1'
  },
  {
    id: 'task5',
    title: 'Update budget spreadsheet',
    description: 'Update monthly expenses and reconcile accounts',
    completed: false,
    createdAt: '2025-03-27T16:45:00Z',
    updatedAt: '2025-03-27T16:45:00Z',
    dueDate: '2025-04-01T23:59:59Z',
    priority: 'low',
    project: 'project4',
    tags: ['finance', 'monthly', 'personal'],
    createdBy: 'user1'
  },
  {
    id: 'task6',
    title: 'Research kitchen cabinet options',
    description: 'Compare prices and styles for kitchen renovation',
    completed: true,
    createdAt: '2025-03-25T19:20:00Z',
    updatedAt: '2025-03-29T11:15:00Z',
    priority: 'low',
    project: 'project5',
    tags: ['renovation', 'research', 'personal'],
    createdBy: 'user1'
  },
  {
    id: 'task7',
    title: 'Prepare presentation for client meeting',
    description: 'Create slides for the upcoming client presentation',
    completed: false,
    createdAt: '2025-03-31T09:45:00Z',
    updatedAt: '2025-03-31T09:45:00Z',
    dueDate: '2025-04-04T14:00:00Z',
    priority: 'high',
    project: 'project1',
    tags: ['presentation', 'client', 'meeting'],
    createdBy: 'user1'
  },
  {
    id: 'task8',
    title: 'Test new ad campaign',
    description: 'Run A/B tests on the new social media ads',
    completed: false,
    createdAt: '2025-03-30T13:20:00Z',
    updatedAt: '2025-03-30T13:20:00Z',
    dueDate: '2025-04-07T23:59:59Z',
    priority: 'medium',
    project: 'project2',
    tags: ['marketing', 'testing', 'ads'],
    createdBy: 'user1'
  }
];

@Injectable({
  providedIn: 'root'
})
export class TaskService implements TaskSubject {
  private tasks: Task[] = MOCK_TASKS;
  private observers: TaskObserver[] = [];

  constructor() { }

  /**
   * Register an observer to receive task updates
   */
  registerObserver(observer: TaskObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  /**
   * Remove an observer
   */
  removeObserver(observer: TaskObserver): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * Notify all observers about task changes
   */
  notifyObservers(task: Task, changeType: TaskChangeType): void {
    this.observers.forEach(observer => {
      observer.update(task, changeType);
    });
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Observable<Task[]> {
    return of([...this.tasks]).pipe(delay(300));
  }

  /**
   * Get task by ID
   */
  getTaskById(id: string): Observable<Task | undefined> {
    const task = this.tasks.find(t => t.id === id);
    return of(task ? {...task} : undefined).pipe(delay(300));
  }

  /**
   * Get tasks by project ID
   */
  getTasksByProject(projectId: string): Observable<Task[]> {
    const projectTasks = this.tasks.filter(t => t.project === projectId);
    return of([...projectTasks]).pipe(delay(300));
  }

  /**
   * Get tasks by completion status
   */
  getTasksByCompletionStatus(completed: boolean): Observable<Task[]> {
    const filteredTasks = this.tasks.filter(t => t.completed === completed);
    return of([...filteredTasks]).pipe(delay(300));
  }

  /**
   * Get tasks by priority
   */
  getTasksByPriority(priority: Priority): Observable<Task[]> {
    const priorityTasks = this.tasks.filter(t => t.priority === priority);
    return of([...priorityTasks]).pipe(delay(300));
  }

  /**
   * Get tasks by tag
   */
  getTasksByTag(tag: string): Observable<Task[]> {
    const taggedTasks = this.tasks.filter(t => t.tags?.includes(tag));
    return of([...taggedTasks]).pipe(delay(300));
  }

  /**
   * Get overdue tasks
   */
  getOverdueTasks(): Observable<Task[]> {
    const now = new Date().toISOString();
    const overdueTasks = this.tasks.filter(t => 
      !t.completed && 
      t.dueDate && 
      t.dueDate < now
    );
    return of([...overdueTasks]).pipe(delay(300));
  }

  /**
   * Get tasks due today
   */
  getTasksDueToday(): Observable<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayIso = today.toISOString();
    const tomorrowIso = tomorrow.toISOString();
    
    const todayTasks = this.tasks.filter(t => 
      !t.completed && 
      t.dueDate && 
      t.dueDate >= todayIso && 
      t.dueDate < tomorrowIso
    );
    
    return of([...todayTasks]).pipe(delay(300));
  }

  /**
   * Get tasks due this week
   */
  getTasksDueThisWeek(): Observable<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    weekStart.setDate(diff);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    const weekStartIso = weekStart.toISOString();
    const weekEndIso = weekEnd.toISOString();
    
    const thisWeekTasks = this.tasks.filter(t => 
      !t.completed && 
      t.dueDate && 
      t.dueDate >= weekStartIso && 
      t.dueDate < weekEndIso
    );
    
    return of([...thisWeekTasks]).pipe(delay(300));
  }

  /**
   * Create a new task
   */
  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Observable<Task> {
    const now = new Date().toISOString();
    
    const newTask: Task = {
      id: `task-${Date.now()}`, // Generate a unique ID
      createdAt: now,
      updatedAt: now,
      ...taskData
    };
    
    this.tasks.push(newTask);
    this.notifyObservers(newTask, TaskChangeType.CREATED);
    return of({...newTask}).pipe(delay(300));
  }

  /**
   * Update an existing task
   */
  updateTask(id: string, updates: Partial<Task>): Observable<Task> {
    const index = this.tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error(`Task with ID ${id} not found`);
    }
    
    const updatedTask: Task = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.tasks[index] = updatedTask;
    this.notifyObservers(updatedTask, TaskChangeType.UPDATED);
    return of({...updatedTask}).pipe(delay(300));
  }

  /**
   * Toggle task completion status
   */
  toggleTaskCompletion(id: string): Observable<Task> {
    const task = this.tasks.find(t => t.id === id);
    
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }
    
    const result = this.updateTask(id, { completed: !task.completed });
    
    // Additional notification for completion status change
    if (!task.completed) {
      this.notifyObservers({...task, completed: true}, TaskChangeType.COMPLETED);
    }
    
    return result;
  }

  /**
   * Complete a task - alias for toggleTaskCompletion for backward compatibility
   */
  completeTask(id: string): Observable<Task> {
    return this.toggleTaskCompletion(id);
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): Observable<boolean> {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      this.notifyObservers(task, TaskChangeType.DELETED);
    }
    
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);
    
    const success = initialLength > this.tasks.length;
    return of(success).pipe(delay(300));
  }

  /**
   * Add a subtask to a task
   */
  addSubtask(taskId: string, subtaskTitle: string): Observable<Task> {
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    
    const subtasks = task.subtasks || [];
    const newSubtask: SubTask = {
      id: `subtask-${Date.now()}`,
      title: subtaskTitle,
      completed: false
    };
    
    const result = this.updateTask(taskId, { 
      subtasks: [...subtasks, newSubtask] 
    });

    // Additional notification for subtask addition
    this.notifyObservers({...task, subtasks: [...subtasks, newSubtask]}, TaskChangeType.SUBTASK_ADDED);
    
    return result;
  }

  /**
   * Update a subtask
   */
  updateSubtask(taskId: string, subtaskId: string, updates: Partial<SubTask>): Observable<Task> {
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task || !task.subtasks) {
      throw new Error(`Task with ID ${taskId} not found or has no subtasks`);
    }
    
    const subtaskIndex = task.subtasks.findIndex(s => s.id === subtaskId);
    
    if (subtaskIndex === -1) {
      throw new Error(`Subtask with ID ${subtaskId} not found`);
    }
    
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      ...updates
    };
    
    return this.updateTask(taskId, { subtasks: updatedSubtasks });
  }

  /**
   * Toggle subtask completion
   */
  toggleSubtaskCompletion(taskId: string, subtaskId: string): Observable<Task> {
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task || !task.subtasks) {
      throw new Error(`Task with ID ${taskId} not found or has no subtasks`);
    }
    
    const subtask = task.subtasks.find(s => s.id === subtaskId);
    
    if (!subtask) {
      throw new Error(`Subtask with ID ${subtaskId} not found`);
    }
    
    const result = this.updateSubtask(taskId, subtaskId, { 
      completed: !subtask.completed 
    });

    // Additional notification for subtask completion
    if (!subtask.completed) {
      const updatedSubtasks = task.subtasks.map(s => 
        s.id === subtaskId ? {...s, completed: true} : s
      );
      this.notifyObservers(
        {...task, subtasks: updatedSubtasks}, 
        TaskChangeType.SUBTASK_COMPLETED
      );
    }
    
    return result;
  }

  /**
   * Delete a subtask
   */
  deleteSubtask(taskId: string, subtaskId: string): Observable<Task> {
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task || !task.subtasks) {
      throw new Error(`Task with ID ${taskId} not found or has no subtasks`);
    }
    
    const deletedSubtask = task.subtasks.find(s => s.id === subtaskId);
    const updatedSubtasks = task.subtasks.filter(s => s.id !== subtaskId);
    
    const result = this.updateTask(taskId, { 
      subtasks: updatedSubtasks 
    });

    // Additional notification for subtask deletion
    if (deletedSubtask) {
      this.notifyObservers(
        {...task, subtasks: updatedSubtasks}, 
        TaskChangeType.SUBTASK_DELETED
      );
    }
    
    return result;
  }

  /**
   * Check for tasks with approaching deadlines
   * This method can be called by a scheduler service
   */
  checkDeadlineApproaching(hoursThreshold: number = 24): void {
    const now = new Date();
    const thresholdDate = new Date(now);
    thresholdDate.setHours(now.getHours() + hoursThreshold);
    const thresholdIso = thresholdDate.toISOString();
    
    this.tasks.forEach(task => {
      if (
        !task.completed && 
        task.dueDate && 
        task.dueDate <= thresholdIso && 
        task.dueDate > now.toISOString()
      ) {
        this.notifyObservers(task, TaskChangeType.DEADLINE_APPROACHING);
      }
    });
  }
}