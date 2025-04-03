import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../../core/services/task.service';
import { ProjectService } from '../../../../core/services/project.service';
import { Task, Priority } from '../../../../core/models/task.model';
import { Project } from '../../../../core/services/project.service';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface TaskFilter {
  status: 'all' | 'active' | 'completed';
  priority: Priority | 'all';
  project: string | 'all';
  search: string;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="task-list-container">
      <header class="task-list-header">
        <h1 class="page-title">All Tasks</h1>
        <a routerLink="/tasks/new" class="new-task-button">
          <span class="button-icon">+</span>
          New Task
        </a>
      </header>

      <!-- Task Filter Bar -->
      <div class="task-filter-bar">
        <div class="filter-section">
          <label for="status-filter">Status</label>
          <select 
            id="status-filter" 
            [(ngModel)]="filters.status" 
            (ngModelChange)="applyFilters()"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div class="filter-section">
          <label for="priority-filter">Priority</label>
          <select 
            id="priority-filter" 
            [(ngModel)]="filters.priority" 
            (ngModelChange)="applyFilters()"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div class="filter-section">
          <label for="project-filter">Project</label>
          <select 
            id="project-filter" 
            [(ngModel)]="filters.project" 
            (ngModelChange)="applyFilters()"
          >
            <option value="all">All Projects</option>
            <option *ngFor="let project of projects$ | async" [value]="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>

        <div class="filter-section search-section">
          <label for="search-filter">Search</label>
          <div class="search-box">
            <input 
              type="text" 
              id="search-filter" 
              [(ngModel)]="filters.search" 
              (ngModelChange)="applyFilters()"
              placeholder="Search tasks..."
            />
            <button class="search-button">🔍</button>
          </div>
        </div>

        <div class="sort-section">
          <label>Sort by</label>
          <div class="sort-options">
            <button 
              [class.active]="sortField === 'dueDate'"
              (click)="sortBy('dueDate')"
            >
              Due Date <span *ngIf="sortField === 'dueDate'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
            </button>
            <button 
              [class.active]="sortField === 'priority'"
              (click)="sortBy('priority')"
            >
              Priority <span *ngIf="sortField === 'priority'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
            </button>
            <button 
              [class.active]="sortField === 'title'"
              (click)="sortBy('title')"
            >
              Name <span *ngIf="sortField === 'title'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
            </button>
            <button 
              [class.active]="sortField === 'createdAt'"
              (click)="sortBy('createdAt')"
            >
              Created <span *ngIf="sortField === 'createdAt'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Task List -->
      <div class="task-list">
        <div *ngIf="(filteredTasks$ | async)?.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <p>No tasks match your filters</p>
          <button class="clear-filters-button" (click)="clearFilters()">Clear Filters</button>
        </div>

        <div *ngFor="let task of filteredTasks$ | async" class="task-item">
          <div class="task-checkbox">
            <input 
              type="checkbox" 
              [checked]="task.completed" 
              (change)="toggleTaskCompletion(task)" 
              [id]="'task-' + task.id"
            />
            <label [for]="'task-' + task.id"></label>
          </div>

          <div class="task-details">
            <a [routerLink]="['/tasks', task.id]" class="task-title" [class.completed]="task.completed">
              {{ task.title }}
            </a>
            <div class="task-description" *ngIf="task.description">
              {{ task.description | slice:0:100 }}{{ task.description.length > 100 ? '...' : '' }}
            </div>
            <div class="task-meta">
              <span class="task-project" *ngIf="task.project && getProjectName(task.project) as projectName">
                <span class="project-dot" [style.backgroundColor]="getProjectColor(task.project)"></span>
                {{ projectName }}
              </span>
              <span class="task-due" *ngIf="task.dueDate">
                <span class="meta-icon">⏰</span>
                {{ isToday(task.dueDate) ? 'Today' : 
                   isTomorrow(task.dueDate) ? 'Tomorrow' : 
                   isYesterday(task.dueDate) ? 'Yesterday' : 
                   (task.dueDate | date:'MMM d, y') }}
              </span>
              <span class="task-priority" [class]="'priority-' + task.priority">
                {{ task.priority }}
              </span>
              <span class="task-subtasks" *ngIf="task.subtasks && task.subtasks.length > 0">
                <span class="meta-icon">☑️</span>
                {{ getCompletedSubtasksCount(task) }}/{{ task.subtasks.length }}
              </span>
            </div>
          </div>

          <div class="task-actions">
            <button class="action-button edit-button" [routerLink]="['/tasks', task.id, 'edit']">
              ✏️
            </button>
            <button class="action-button delete-button" (click)="deleteTask(task)">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-controls" *ngIf="totalPages > 1">
        <button 
          class="pagination-button" 
          [disabled]="currentPage === 1"
          (click)="goToPage(currentPage - 1)"
        >
          Previous
        </button>
        
        <div class="page-numbers">
          <button 
            *ngFor="let page of pagesArray" 
            class="page-number" 
            [class.active]="page === currentPage"
            (click)="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="pagination-button" 
          [disabled]="currentPage === totalPages"
          (click)="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .task-list-container {
      padding: 1rem 0;
    }

    .task-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
      color: #333;
    }

    .new-task-button {
      display: flex;
      align-items: center;
      background-color: #0d6efd;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
    }

    .button-icon {
      margin-right: 0.5rem;
      font-size: 1rem;
    }

    .task-filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      background-color: white;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filter-section {
      display: flex;
      flex-direction: column;
    }

    .filter-section label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }

    .filter-section select,
    .filter-section input {
      min-width: 150px;
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .search-section {
      flex-grow: 1;
    }

    .search-box {
      position: relative;
    }

    .search-box input {
      width: 100%;
      padding-right: 2.5rem;
    }

    .search-button {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      color: #6c757d;
    }

    .sort-section {
      margin-left: auto;
    }

    .sort-options {
      display: flex;
      gap: 0.5rem;
    }

    .sort-options button {
      background: none;
      border: none;
      font-size: 0.875rem;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      color: #6c757d;
    }

    .sort-options button.active {
      background-color: rgba(13, 110, 253, 0.1);
      color: #0d6efd;
      font-weight: 500;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .task-item {
      display: flex;
      align-items: flex-start;
      background-color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .task-checkbox {
      margin-right: 1rem;
      padding-top: 0.25rem;
    }

    .task-checkbox input {
      display: none;
    }

    .task-checkbox label {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid #ced4da;
      border-radius: 4px;
      position: relative;
      cursor: pointer;
    }

    .task-checkbox input:checked + label {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }

    .task-checkbox input:checked + label::after {
      content: '✓';
      position: absolute;
      color: white;
      font-size: 14px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .task-details {
      flex: 1;
    }

    .task-title {
      font-size: 1rem;
      font-weight: 600;
      color: #333;
      text-decoration: none;
      margin-bottom: 0.5rem;
      display: block;
    }

    .task-title.completed {
      text-decoration: line-through;
      color: #6c757d;
    }

    .task-description {
      font-size: 0.875rem;
      color: #6c757d;
      margin-bottom: 0.75rem;
    }

    .task-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.75rem;
    }

    .task-project {
      display: flex;
      align-items: center;
    }

    .project-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 0.5rem;
    }

    .task-due {
      display: flex;
      align-items: center;
    }

    .meta-icon {
      margin-right: 0.25rem;
    }

    .task-priority {
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      text-transform: capitalize;
      font-weight: 500;
    }

    .priority-low {
      background-color: rgba(40, 167, 69, 0.1);
      color: #28a745;
    }

    .priority-medium {
      background-color: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }

    .priority-high {
      background-color: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }

    .priority-urgent {
      background-color: #dc3545;
      color: white;
    }

    .task-subtasks {
      display: flex;
      align-items: center;
    }

    .task-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-button {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 4px;
      background-color: #f8f9fa;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .action-button:hover {
      background-color: #e9ecef;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .clear-filters-button {
      margin-top: 1rem;
      background-color: #f8f9fa;
      border: 1px solid #ced4da;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .pagination-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 2rem;
      gap: 1rem;
    }

    .pagination-button {
      background-color: white;
      border: 1px solid #ced4da;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .pagination-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 0.5rem;
    }

    .page-number {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .page-number.active {
      background-color: #0d6efd;
      color: white;
      border-color: #0d6efd;
    }

    @media (max-width: 768px) {
      .task-filter-bar {
        flex-direction: column;
      }

      .filter-section,
      .sort-section {
        width: 100%;
      }

      .sort-options {
        justify-content: space-between;
        width: 100%;
      }
    }
  `]
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);

  tasks$: Observable<Task[]> = this.taskService.getAllTasks();
  projects$: Observable<Project[]> = this.projectService.getActiveProjects();
  
  // Filter state
  filters: TaskFilter = {
    status: 'all',
    priority: 'all',
    project: 'all',
    search: ''
  };
  
  // Sort state
  sortField: keyof Task = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Pagination
  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  pagesArray: number[] = [1];

  // Projects map for quick lookup
  projectsMap: {[id: string]: Project} = {};
  
  // Filtered tasks
  private filterSubject = new BehaviorSubject<TaskFilter>(this.filters);
  private sortSubject = new BehaviorSubject<{field: keyof Task, direction: 'asc' | 'desc'}>({
    field: this.sortField,
    direction: this.sortDirection
  });
  
  filteredTasks$: Observable<Task[]> = combineLatest([
    this.tasks$,
    this.filterSubject,
    this.sortSubject
  ]).pipe(
    map(([tasks, filters, sort]) => {
      // Apply filters
      let filteredTasks = tasks;
      
      // Status filter
      if (filters.status !== 'all') {
        filteredTasks = filteredTasks.filter(task => 
          filters.status === 'completed' ? task.completed : !task.completed
        );
      }
      
      // Priority filter
      if (filters.priority !== 'all') {
        filteredTasks = filteredTasks.filter(task => 
          task.priority === filters.priority
        );
      }
      
      // Project filter
      if (filters.project !== 'all') {
        filteredTasks = filteredTasks.filter(task => 
          task.project === filters.project
        );
      }
      
      // Search filter
      if (filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        filteredTasks = filteredTasks.filter(task => 
          task.title.toLowerCase().includes(searchTerm) || 
          (task.description && task.description.toLowerCase().includes(searchTerm))
        );
      }
      
      // Apply sorting
      filteredTasks = [...filteredTasks].sort((a, b) => {
        let comparison = 0;
        
        // Handle null/undefined values
        if (a[sort.field] === null || a[sort.field] === undefined) {
          return sort.direction === 'asc' ? 1 : -1;  // Nulls last
        }
        
        if (b[sort.field] === null || b[sort.field] === undefined) {
          return sort.direction === 'asc' ? -1 : 1;  // Nulls last
        }
        
        // Special case for priority
        if (sort.field === 'priority') {
          const priorityOrder: Record<string, number> = { 'low': 0, 'medium': 1, 'high': 2, 'urgent': 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        } 
        // Date comparisons
        else if (sort.field === 'dueDate' || sort.field === 'createdAt') {
          const dateA = new Date(a[sort.field] as string).getTime();
          const dateB = new Date(b[sort.field] as string).getTime();
          comparison = dateA - dateB;
        } 
        // String comparisons
        else if (typeof a[sort.field] === 'string') {
          comparison = (a[sort.field] as string).localeCompare(b[sort.field] as string);
        } 
        // Array comparisons (like subtasks)
        else if (Array.isArray(a[sort.field])) {
          const arrayA = a[sort.field] as Array<unknown>;
          const arrayB = b[sort.field] as Array<unknown>;
          comparison = arrayA.length - arrayB.length;
        }
        // Boolean comparisons
        else if (typeof a[sort.field] === 'boolean') {
          comparison = (a[sort.field] === b[sort.field]) ? 0 : (a[sort.field] ? 1 : -1);
        }
        // Number comparisons - with explicit type checking
        else if (typeof a[sort.field] === 'number' && typeof b[sort.field] === 'number') {
          // Safe casting since we've verified the types
          comparison = Number(a[sort.field]) - Number(b[sort.field]);
        }
        
        return sort.direction === 'asc' ? comparison : -comparison;
      });
      
      // Update pagination values
      this.totalPages = Math.ceil(filteredTasks.length / this.itemsPerPage);
      this.pagesArray = Array.from({length: this.totalPages}, (_, i) => i + 1);
      
      // Apply pagination
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      return filteredTasks.slice(startIndex, startIndex + this.itemsPerPage);
    })
  );

  ngOnInit(): void {
    // Build a map of projects for quick lookup
    this.projects$.subscribe(projects => {
      this.projectsMap = {};
      projects.forEach(project => {
        this.projectsMap[project.id] = project;
      });
    });
  }

  applyFilters(): void {
    this.currentPage = 1; // Reset to first page when filters change
    this.filterSubject.next(this.filters);
  }

  clearFilters(): void {
    this.filters = {
      status: 'all',
      priority: 'all',
      project: 'all',
      search: ''
    };
    this.applyFilters();
  }

  sortBy(field: keyof Task): void {
    if (this.sortField === field) {
      // Toggle direction if clicking the same field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Default to ascending for new sort field
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.sortSubject.next({
      field: this.sortField,
      direction: this.sortDirection
    });
  }

  toggleTaskCompletion(task: Task): void {
    if (task.completed) {
      // Undo completion
      this.taskService.updateTask(task.id, { completed: false }).subscribe();
    } else {
      // Complete task
      this.taskService.completeTask(task.id).subscribe();
    }
  }

  deleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      this.taskService.deleteTask(task.id).subscribe();
    }
  }

  getProjectName(projectId: string): string {
    return this.projectsMap[projectId]?.name || 'Unknown Project';
  }

  getProjectColor(projectId: string): string {
    return this.projectsMap[projectId]?.color || '#e9ecef';
  }

  getCompletedSubtasksCount(task: Task): number {
    if (!task.subtasks) return 0;
    return task.subtasks.filter(subtask => subtask.completed).length;
  }

  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isTomorrow(dateString: string): boolean {
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return date.getDate() === tomorrow.getDate() &&
           date.getMonth() === tomorrow.getMonth() &&
           date.getFullYear() === tomorrow.getFullYear();
  }

  isYesterday(dateString: string): boolean {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return date.getDate() === yesterday.getDate() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getFullYear() === yesterday.getFullYear();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.filterSubject.next(this.filters); // Trigger update
  }
}