import React, { useState, useEffect } from 'react';
import { useTodos, Todo, TodoStatus, TodoPriority } from '@/app/contexts/TodoContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface TodoFormProps {
  todo?: Todo;
  onClose: () => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({ todo, onClose }) => {
  const { addTodo, updateTodo, getTodoById } = useTodos();
  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [status, setStatus] = useState<TodoStatus>(todo?.status || 'Pending');
  const [priority, setPriority] = useState<TodoPriority>(todo?.priority || 'Medium');
  const [dueDate, setDueDate] = useState(
    todo?.dueDate ? todo.dueDate.slice(0, 10) : '',
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setStatus(todo.status);
      setPriority(todo.priority);
      setDueDate(todo.dueDate ? todo.dueDate.slice(0, 10) : '');
    }
  }, [todo]);

  useEffect(() => {
    // Ensure edit form is showing the latest server state (covers GET /api/Todo/{id})
    if (!todo?.id) return;
    let cancelled = false;
    (async () => {
      const latest = await getTodoById(todo.id);
      if (!latest || cancelled) return;
      setTitle(latest.title);
      setDescription(latest.description || '');
      setStatus(latest.status);
      setPriority(latest.priority);
      setDueDate(latest.dueDate ? latest.dueDate.slice(0, 10) : '');
    })();
    return () => {
      cancelled = true;
    };
  }, [todo?.id, getTodoById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (title.length > 100) {
      setError('Title must be less than 100 characters');
      return;
    }

    const todoData = {
      title,
      description,
      status,
      priority,
      dueDate,
    };

    setLoading(true);
    const result = todo
      ? await updateTodo(todo.id, todoData)
      : await addTodo(todoData);
    setLoading(false);

    if (result.success) {
      toast.success(todo ? 'Todo updated successfully!' : 'Todo created successfully!');
      onClose();
    } else {
      setError(result.error || 'Operation failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{todo ? 'Edit Todo' : 'Create New Todo'}</CardTitle>
              <CardDescription>
                {todo ? 'Update your todo details' : 'Add a new task to your list'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter todo title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500">{title.length}/100 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter todo description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as TodoStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="InProgress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as TodoPriority)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">
                  Due Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save size={16} className="mr-2" />
                {loading ? 'Saving...' : todo ? 'Update Todo' : 'Create Todo'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
