import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { ToDoCountDTO, ToDoSortOption, TodoPriority, TodoStatus, TodoToReturnDTO } from '@/app/services/apiTypes';
import * as todoApi from '@/app/services/todoApi';
import { formatApiError } from '@/app/services/apiError';
import { useAuth } from '@/app/contexts/AuthContext';

export type { TodoStatus, TodoPriority } from '@/app/services/apiTypes';

export interface Todo {
  id: string; // Guid
  title: string;
  description?: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string; // DateTimeOffset ISO
  createdDate: string; // DateTimeOffset ISO
  lastModifiedDate: string; // DateTimeOffset ISO
  isDueSoon: boolean;
}

export interface TodoFilters {
  status?: TodoStatus;
  priority?: TodoPriority;
  dateFrom?: string;
  dateTo?: string;
}

export type SortOption = 'dueDate' | 'priority' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

interface TodoContextType {
  todos: Todo[];
  counts: ToDoCountDTO | null;
  refresh: () => Promise<void>;
  getTodoById: (id: string) => Promise<Todo | null>;
  addTodo: (todo: {
    title: string;
    description?: string | null;
    status?: TodoStatus;
    priority: TodoPriority;
    dueDate: string; // yyyy-mm-dd from <input type="date">
  }) => Promise<{ success: boolean; error?: string }>;
  updateTodo: (id: string, todo: Partial<Todo>) => Promise<{ success: boolean; error?: string }>;
  deleteTodo: (id: string) => Promise<{ success: boolean; error?: string }>;
  markAsCompleted: (id: string) => Promise<{ success: boolean; error?: string }>;
  filters: TodoFilters;
  setFilters: (filters: TodoFilters) => void;
  sortBy: SortOption;
  sortOrder: SortOrder;
  setSorting: (sortBy: SortOption, sortOrder: SortOrder) => void;
  filteredAndSortedTodos: Todo[];
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [counts, setCounts] = useState<ToDoCountDTO | null>(null);
  const [filters, setFilters] = useState<TodoFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  const mapTodo = (t: TodoToReturnDTO): Todo => ({
    id: t.id,
    title: t.title,
    description: t.description ?? '',
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    createdDate: t.createdDate,
    lastModifiedDate: t.lastModifiedDate,
    isDueSoon: t.isDueSoon,
  });

  const toSortOption = (by: SortOption, order: SortOrder): ToDoSortOption => {
    if (by === 'createdAt') return order === 'asc' ? 'CreatedDateAsc' : 'CreatedDateDesc';
    if (by === 'priority') return order === 'asc' ? 'PriorityAsc' : 'PriorityDesc';
    return order === 'asc' ? 'DueDateAsc' : 'DueDateDesc';
  };

  const refresh = async () => {
    if (!user?.token) {
      setTodos([]);
      setCounts(null);
      return;
    }
    try {
      const sort = toSortOption(sortBy, sortOrder);
      const data = await todoApi.getTodos({
        status: filters.status,
        priority: filters.priority,
        sort,
        token: user.token,
      });
      setTodos(data.map(mapTodo));
      const nextCounts = await todoApi.getCounts(user.token);
      setCounts(nextCounts);
    } catch {
      // List screen already has empty-state; keep silent here.
      // Individual actions return errors to the caller.
    }
  };

  const getTodoById = async (id: string): Promise<Todo | null> => {
    if (!user?.token) return null;
    try {
      const t = await todoApi.getTodoById(id, user.token);
      return mapTodo(t);
    } catch {
      return null;
    }
  };

  const addTodo = async (todoData: {
    title: string;
    description?: string | null;
    status?: TodoStatus;
    priority: TodoPriority;
    dueDate: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user?.token) return { success: false, error: 'Not authenticated' };
    try {
      // Backend expects DateTimeOffset; <input type="date"> gives yyyy-mm-dd. Convert to ISO.
      const dueIso = new Date(todoData.dueDate).toISOString();
      const created = await todoApi.createTodo({
        title: todoData.title,
        description: todoData.description ?? null,
        priority: todoData.priority,
        dueDate: dueIso,
      }, user.token);

      // Backend create defaults Status to Pending. If UI selected a different status, follow up with an update.
      if (todoData.status && todoData.status !== 'Pending') {
        await todoApi.updateTodo(created.id, { status: todoData.status }, user.token);
      }

      await refresh();
      return { success: true };
    } catch (e) {
      return { success: false, error: formatApiError(e, 'Failed to create todo') };
    }
  };

  const updateTodo = async (id: string, todoData: Partial<Todo>): Promise<{ success: boolean; error?: string }> => {
    if (!user?.token) return { success: false, error: 'Not authenticated' };
    try {
      const dto: Record<string, unknown> = {};
      if (todoData.title !== undefined) dto.title = todoData.title;
      if (todoData.description !== undefined) dto.description = todoData.description;
      if (todoData.status !== undefined) dto.status = todoData.status;
      if (todoData.priority !== undefined) dto.priority = todoData.priority;
      if (todoData.dueDate !== undefined) {
        // Accept either yyyy-mm-dd (from input) or ISO; normalize to ISO for backend.
        dto.dueDate = todoData.dueDate.includes('T') ? todoData.dueDate : new Date(todoData.dueDate).toISOString();
      }

      const ok = await todoApi.updateTodo(id, dto as any, user.token);
      if (!ok) return { success: false, error: 'Update failed' };
      await refresh();
      return { success: true };
    } catch (e) {
      return { success: false, error: formatApiError(e, 'Failed to update todo') };
    }
  };

  const deleteTodo = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!user?.token) return { success: false, error: 'Not authenticated' };
    try {
      const ok = await todoApi.deleteTodo(id, user.token);
      if (!ok) return { success: false, error: 'Delete failed' };
      await refresh();
      return { success: true };
    } catch (e) {
      return { success: false, error: formatApiError(e, 'Failed to delete todo') };
    }
  };

  const markAsCompleted = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!user?.token) return { success: false, error: 'Not authenticated' };
    try {
      const ok = await todoApi.markAsCompleted(id, user.token);
      if (!ok) return { success: false, error: 'Update failed' };
      await refresh();
      return { success: true };
    } catch (e) {
      return { success: false, error: formatApiError(e, 'Failed to mark as completed') };
    }
  };

  const setSorting = (newSortBy: SortOption, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const filteredAndSortedTodos = React.useMemo(() => {
    let result = [...todos];

    // Apply filters
    if (filters.status) {
      result = result.filter(todo => todo.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter(todo => todo.priority === filters.priority);
    }
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      result = result.filter(todo => new Date(todo.dueDate).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime();
      result = result.filter(todo => new Date(todo.dueDate).getTime() <= to);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'dueDate') {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [todos, filters, sortBy, sortOrder]);

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority, sortBy, sortOrder]);

  const value = useMemo(
    () => ({
      todos,
      counts,
      refresh,
      getTodoById,
      addTodo,
      updateTodo,
      deleteTodo,
      markAsCompleted,
      filters,
      setFilters,
      sortBy,
      sortOrder,
      setSorting,
      filteredAndSortedTodos,
    }),
    [todos, counts, filters, sortBy, sortOrder, filteredAndSortedTodos],
  );

  return (
    <TodoContext.Provider
      value={value}
    >
      {children}
    </TodoContext.Provider>
  );
};
