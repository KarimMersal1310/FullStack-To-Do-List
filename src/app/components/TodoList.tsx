import React, { useState } from 'react';
import { useTodos, Todo } from '@/app/contexts/TodoContext';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Card, CardContent } from '@/app/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { Edit, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface TodoListProps {
  onEditTodo: (todo: Todo) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ onEditTodo }) => {
  const { filteredAndSortedTodos, deleteTodo, updateTodo, markAsCompleted } = useTodos();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setLoading(id);
    const result = await deleteTodo(id);
    setLoading(null);
    setDeleteConfirm(null);

    if (result.success) {
      toast.success('Todo deleted successfully!');
    } else {
      toast.error(result.error || 'Failed to delete todo');
    }
  };

  const handleMarkComplete = async (todo: Todo) => {
    setLoading(todo.id);
    const result =
      todo.status === 'Completed'
        ? await updateTodo(todo.id, { status: 'Pending' })
        : await markAsCompleted(todo.id);
    setLoading(null);

    if (result.success) {
      toast.success(
        todo.status === 'Completed' ? 'Todo marked as pending' : 'Todo completed!'
      );
    } else {
      toast.error(result.error || 'Failed to update todo');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive', icon: React.ReactNode }> = {
      Pending: { variant: 'secondary', icon: <Circle size={12} className="mr-1" /> },
      InProgress: { variant: 'default', icon: <Clock size={12} className="mr-1" /> },
      Completed: { variant: 'outline', icon: <CheckCircle2 size={12} className="mr-1" /> },
    };
    const config = variants[status] || variants.Pending;
    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {status === 'InProgress' ? 'In Progress' : status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      Low: 'bg-green-100 text-green-800 border-green-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      High: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Completed') return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  if (filteredAndSortedTodos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="bg-gray-100 p-4 rounded-full">
                <CheckCircle2 size={48} className="text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-700">No todos found</h3>
            <p className="text-gray-500">
              {'Create your first todo to get started!'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTodos.map((todo) => {
                  const dueSoon = isDueSoon(todo.dueDate);
                  const overdue = isOverdue(todo.dueDate, todo.status);

                  return (
                    <TableRow key={todo.id} className={overdue ? 'bg-red-50' : dueSoon ? 'bg-yellow-50' : ''}>
                      <TableCell className="font-medium max-w-[200px]">
                        <div className="truncate">{todo.title}</div>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <div className="truncate text-gray-600">
                          {todo.description || <span className="italic text-gray-400">No description</span>}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(todo.status)}</TableCell>
                      <TableCell>{getPriorityBadge(todo.priority)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{formatDate(todo.dueDate)}</div>
                          {overdue && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          )}
                          {dueSoon && !overdue && (
                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">Due Soon</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(todo.createdDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkComplete(todo)}
                            disabled={loading === todo.id}
                            title={todo.status === 'Completed' ? 'Mark as Pending' : 'Mark as Complete'}
                          >
                            <CheckCircle2 size={16} className={todo.status === 'Completed' ? 'text-green-600' : ''} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditTodo(todo)}
                            disabled={loading === todo.id}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(todo.id)}
                            disabled={loading === todo.id}
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Todo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this todo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
