// Task model for the Todo application

// Priority levels for tasks
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Subtask model
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

// Task model
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority: Priority;
  project?: string;
  tags?: string[];
  subtasks?: SubTask[];
  createdBy: string;
}
