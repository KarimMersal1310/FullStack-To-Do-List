import type {
  CreateToDoDTO,
  ToDoCountDTO,
  TodoPriority,
  TodoStatus,
  TodoToReturnDTO,
  ToDoSortOption,
  UpdateTodoDTO,
} from './apiTypes';
import { httpRequest } from './http';

export async function getTodos(params: {
  status?: TodoStatus;
  priority?: TodoPriority;
  sort?: ToDoSortOption;
  token: string;
}): Promise<TodoToReturnDTO[]> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.priority) qs.set('priority', params.priority);
  if (params.sort) qs.set('sort', params.sort);
  // Backend signature includes `sort` non-nullable, so if omitted it becomes default enum value (CreatedDateAsc).

  const url = qs.toString() ? `/api/Todo?${qs.toString()}` : '/api/Todo';
  return httpRequest<TodoToReturnDTO[]>(url, { method: 'GET', token: params.token });
}

export async function getTodoById(id: string, token: string): Promise<TodoToReturnDTO> {
  return httpRequest<TodoToReturnDTO>(`/api/Todo/${id}`, { method: 'GET', token });
}

export async function createTodo(dto: CreateToDoDTO, token: string): Promise<TodoToReturnDTO> {
  return httpRequest<TodoToReturnDTO>('/api/Todo', { method: 'POST', body: dto, token });
}

export async function updateTodo(id: string, dto: UpdateTodoDTO, token: string): Promise<boolean> {
  return httpRequest<boolean>(`/api/Todo/${id}`, { method: 'PUT', body: dto, token });
}

export async function deleteTodo(id: string, token: string): Promise<boolean> {
  return httpRequest<boolean>(`/api/Todo/${id}`, { method: 'DELETE', token });
}

export async function markAsCompleted(id: string, token: string): Promise<boolean> {
  return httpRequest<boolean>(`/api/Todo/${id}`, { method: 'PATCH', token });
}

export async function getCounts(token: string): Promise<ToDoCountDTO> {
  return httpRequest<ToDoCountDTO>('/api/Todo/Count', { method: 'GET', token });
}

