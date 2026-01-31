export type TodoStatus = 'Pending' | 'InProgress' | 'Completed';
export type TodoPriority = 'Low' | 'Medium' | 'High';

// Matches backend ToDoSortOption enum names exactly
export type ToDoSortOption =
  | 'CreatedDateAsc'
  | 'CreatedDateDesc'
  | 'DueDateAsc'
  | 'DueDateDesc'
  | 'PriorityAsc'
  | 'PriorityDesc';

// ================
// Auth DTOs (backend)
// ================
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateDTO {
  fullName?: string | null;
  email?: string | null;
  oldPassword?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
}

export interface UserToReturnDTO {
  email: string;
  displayName: string;
  fullName: string;
  token: string;
}

// ================
// Todo DTOs (backend)
// ================
export interface CreateToDoDTO {
  title: string;
  description?: string | null;
  priority: string; // backend parses enum from string; invalid defaults to Medium
  dueDate: string; // DateTimeOffset as ISO string
}

export interface UpdateTodoDTO {
  title?: string | null;
  description?: string | null;
  status?: string | null; // backend parses enum from string; invalid defaults to Pending
  priority?: string | null; // backend parses enum from string; invalid defaults to Medium
  dueDate?: string | null; // DateTimeOffset as ISO string
}

export interface TodoToReturnDTO {
  id: string;
  title: string;
  description?: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string; // DateTimeOffset ISO
  createdDate: string; // DateTimeOffset ISO
  lastModifiedDate: string; // DateTimeOffset ISO
  isDueSoon: boolean;
}

export interface ToDoCountDTO {
  totalTodos: number;
  pending: number;
  inProgress: number;
  completed: number;
}

// ================
// Error shapes (backend)
// ================
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  // Backend sometimes returns validation details as either:
  // - "errors": { field: [messages...] }  (ASP.NET ValidationProblem)
  // - "errors": [ [field, [messages...]], ... ] via ApiResponseFactory Extensions["Errors"]
  errors?: Record<string, string[]>; // ValidationProblemDetails
  Errors?: Array<[string, string[]]>; // ApiResponseFactory Extensions
  [key: string]: unknown;
}

