export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'completed';
export type TaskFilter = 'all' | 'pending' | 'completed' | 'high-priority';
export type SortOption = 'dueDateAsc' | 'dueDateDesc' | 'priority' | 'newest';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: Priority;
  dueDate: string;
  status?: Status;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  status?: Status;
}

export interface HealthResponse {
  status: string;
  database: string;
  databaseId: string;
  projectId: string;
  timestamp: string;
  service: string;
}
