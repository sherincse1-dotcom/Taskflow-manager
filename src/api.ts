import { Task, CreateTaskInput, UpdateTaskInput, HealthResponse } from './types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Health check returned status ${res.status}`);
  }
  return res.json();
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch tasks (HTTP ${res.status})`);
  }
  const result = await res.json();
  return result.data || [];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create task (HTTP ${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update task (HTTP ${res.status})`);
  }
  const result = await res.json();
  return result.data;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete task (HTTP ${res.status})`);
  }
}

export async function seedDemoTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks/seed`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to seed demo tasks (HTTP ${res.status})`);
  }
  const result = await res.json();
  return result.data || [];
}
