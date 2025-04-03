import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  createdBy: string;
}

// Mock data for development purposes
const MOCK_PROJECTS: Project[] = [
  {
    id: 'project1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website',
    color: '#4285F4', // Blue
    createdAt: '2025-03-15T09:00:00Z',
    updatedAt: '2025-03-15T09:00:00Z',
    isActive: true,
    createdBy: 'user1'
  },
  {
    id: 'project2',
    name: 'Marketing Campaign',
    description: 'Q2 marketing campaign for new product launch',
    color: '#EA4335', // Red
    createdAt: '2025-03-20T10:30:00Z',
    updatedAt: '2025-03-20T10:30:00Z',
    isActive: true,
    createdBy: 'user1'
  },
  {
    id: 'project3',
    name: 'Mobile App Development',
    description: 'iOS and Android app for client',
    color: '#34A853', // Green
    createdAt: '2025-03-25T14:00:00Z',
    updatedAt: '2025-03-25T14:00:00Z',
    isActive: true,
    createdBy: 'user1'
  },
  {
    id: 'project4',
    name: 'Personal Finance',
    description: 'Personal budget and finance management',
    color: '#FBBC05', // Yellow
    createdAt: '2025-03-10T08:00:00Z',
    updatedAt: '2025-03-10T08:00:00Z',
    isActive: true,
    createdBy: 'user1'
  },
  {
    id: 'project5',
    name: 'Home Renovation',
    description: 'Kitchen and bathroom remodel',
    color: '#9C27B0', // Purple
    createdAt: '2025-03-05T17:30:00Z',
    updatedAt: '2025-03-05T17:30:00Z',
    isActive: false,
    createdBy: 'user1'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects: Project[] = MOCK_PROJECTS;

  constructor() { }

  /**
   * Get all projects
   */
  getAllProjects(): Observable<Project[]> {
    return of([...this.projects]).pipe(delay(300));
  }

  /**
   * Get only active projects
   */
  getActiveProjects(): Observable<Project[]> {
    const activeProjects = this.projects.filter(project => project.isActive);
    return of([...activeProjects]).pipe(delay(300));
  }

  /**
   * Get a project by ID
   */
  getProjectById(id: string): Observable<Project | undefined> {
    const project = this.projects.find(p => p.id === id);
    return of(project ? {...project} : undefined).pipe(delay(300));
  }

  /**
   * Create a new project
   */
  createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Observable<Project> {
    const now = new Date().toISOString();
    
    const newProject: Project = {
      id: `project-${Date.now()}`, // Generate a unique ID
      createdAt: now,
      updatedAt: now,
      ...projectData
    };
    
    this.projects.push(newProject);
    return of({...newProject}).pipe(delay(300));
  }

  /**
   * Update an existing project
   */
  updateProject(id: string, updates: Partial<Project>): Observable<Project> {
    const index = this.projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error(`Project with ID ${id} not found`);
    }
    
    const updatedProject: Project = {
      ...this.projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.projects[index] = updatedProject;
    return of({...updatedProject}).pipe(delay(300));
  }

  /**
   * Delete a project
   */
  deleteProject(id: string): Observable<boolean> {
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== id);
    
    const success = initialLength > this.projects.length;
    return of(success).pipe(delay(300));
  }

  /**
   * Archive a project (mark as inactive)
   */
  archiveProject(id: string): Observable<Project> {
    return this.updateProject(id, { 
      isActive: false 
    });
  }

  /**
   * Restore an archived project (mark as active)
   */
  restoreProject(id: string): Observable<Project> {
    return this.updateProject(id, { 
      isActive: true 
    });
  }
}