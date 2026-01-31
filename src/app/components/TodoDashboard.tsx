import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTodos, Todo } from '@/app/contexts/TodoContext';
import { Button } from '@/app/components/ui/button';
import { TodoFilters } from './TodoFilters';
import { TodoList } from './TodoList';
import { TodoForm } from './TodoForm';
import { UserProfile } from './UserProfile';
import { CheckCircle2, Plus, User, LogOut } from 'lucide-react';

export const TodoDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { todos, filteredAndSortedTodos, counts } = useTodos();
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>(undefined);

  const handleCreateTodo = () => {
    setEditingTodo(undefined);
    setShowTodoForm(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowTodoForm(true);
  };

  const handleCloseTodoForm = () => {
    setShowTodoForm(false);
    setEditingTodo(undefined);
  };

  const stats = {
    total: counts?.totalTodos ?? todos.length,
    pending: counts?.pending ?? todos.filter(t => t.status === 'Pending').length,
    inProgress: counts?.inProgress ?? todos.filter(t => t.status === 'InProgress').length,
    completed: counts?.completed ?? todos.filter(t => t.status === 'Completed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">To Do Manager</h1>
                <p className="text-sm text-gray-600">Stay organized, stay productive</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-2 hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowProfile(true)}>
                <User size={16} className="mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Total Todos</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 mb-1">In Progress</div>
            <div className="text-3xl font-bold text-purple-600">{stats.inProgress}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button onClick={handleCreateTodo} className="gap-2">
            <Plus size={18} />
            Add New Todo
          </Button>
          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredAndSortedTodos.length} of {todos.length} todos
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <TodoFilters />
        </div>

        {/* Todo List */}
        <TodoList onEditTodo={handleEditTodo} />
      </main>

      {/* Modals */}
      {showTodoForm && (
        <TodoForm todo={editingTodo} onClose={handleCloseTodoForm} />
      )}

      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};
