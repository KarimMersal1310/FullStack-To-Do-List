import React, { useState } from 'react';
import { useTodos, TodoStatus, TodoPriority, SortOption, SortOrder } from '@/app/contexts/TodoContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent } from '@/app/components/ui/card';
import { Filter, X, ArrowUpDown } from 'lucide-react';

export const TodoFilters: React.FC = () => {
  const { filters, setFilters, sortBy, sortOrder, setSorting } = useTodos();
  const [showFilters, setShowFilters] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>(filters.status || 'all');
  const [localPriority, setLocalPriority] = useState<string>(filters.priority || 'all');
  const [localDateFrom, setLocalDateFrom] = useState(filters.dateFrom || '');
  const [localDateTo, setLocalDateTo] = useState(filters.dateTo || '');
  const [localSortBy, setLocalSortBy] = useState<SortOption>(sortBy);
  const [localSortOrder, setLocalSortOrder] = useState<SortOrder>(sortOrder);

  const handleApplyFilters = () => {
    setFilters({
      status: localStatus === 'all' ? undefined : (localStatus as TodoStatus),
      priority: localPriority === 'all' ? undefined : (localPriority as TodoPriority),
      dateFrom: localDateFrom || undefined,
      dateTo: localDateTo || undefined,
    });
    setSorting(localSortBy, localSortOrder);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setLocalStatus('all');
    setLocalPriority('all');
    setLocalDateFrom('');
    setLocalDateTo('');
    setLocalSortBy('dueDate');
    setLocalSortOrder('asc');
    setFilters({});
    setSorting('dueDate', 'asc');
  };

  const activeFiltersCount = [
    filters.status,
    filters.priority,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter size={16} />
          Filters & Sort
          {activeFiltersCount > 0 && (
            <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={handleClearFilters} className="gap-2">
            <X size={16} />
            Clear All
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-status">Status</Label>
                  <Select value={localStatus} onValueChange={setLocalStatus}>
                    <SelectTrigger id="filter-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="InProgress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter-priority">Priority</Label>
                  <Select value={localPriority} onValueChange={setLocalPriority}>
                    <SelectTrigger id="filter-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter-date-from">Due Date From</Label>
                  <Input
                    id="filter-date-from"
                    type="date"
                    value={localDateFrom}
                    onChange={(e) => setLocalDateFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter-date-to">Due Date To</Label>
                  <Input
                    id="filter-date-to"
                    type="date"
                    value={localDateTo}
                    onChange={(e) => setLocalDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <ArrowUpDown size={16} />
                  Sorting
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sort-by">Sort By</Label>
                    <Select value={localSortBy} onValueChange={(value) => setLocalSortBy(value as SortOption)}>
                      <SelectTrigger id="sort-by">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort-order">Order</Label>
                    <Select value={localSortOrder} onValueChange={(value) => setLocalSortOrder(value as SortOrder)}>
                      <SelectTrigger id="sort-order">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleApplyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={() => setShowFilters(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
