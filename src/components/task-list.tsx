import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, CheckCircle2, ChevronDown, ChevronRight, Circle, Columns, Filter as FilterIcon, Pencil, Plus, Search, Trash2, X, XCircle } from "lucide-react";

// Icons are now properly imported and available for use
import { cn } from "@/lib/utils";

export interface Task {
  taskId: string;
  taskType: string;
  description: string;
  totalHours: number;
  approvedHours: number;
  project: string;
  month: string;
  note?: string;
  status: 'todo' | 'in-progress' | 'done';
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onFilterChange?: (filter: string) => void;
}

interface Filters {
  search: string;
  month: string;
  taskType: string;
  project: string;
  taskId: string;
  status: string;
}

const allMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function TaskList({ tasks, onToggleTask, onDeleteTask, onEditTask, onFilterChange }: TaskListProps) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    month: 'All Months',
    taskType: 'All Types',
    project: 'All Projects',
    taskId: '',
    status: 'All Statuses'
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    taskId: true,
    taskType: true,
    description: true,
    totalHours: true,
    approvedHours: true,
    project: true,
    month: true,
    status: true,
    note: false, // Note column unchecked by default
    actions: true
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const filterRef = useRef<HTMLDivElement>(null);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  // Get unique values for filter dropdowns
  const { taskTypes, projects, months, statuses } = useMemo(() => {
    const typeSet = new Set<string>();
    const projectSet = new Set<string>();
    const monthSet = new Set<string>();
    const statusSet = new Set<string>();

    tasks.forEach(task => {
      typeSet.add(task.taskType);
      projectSet.add(task.project);
      monthSet.add(task.month);
      statusSet.add(task.status);
    });

    return {
      taskTypes: Array.from(typeSet).sort(),
      projects: Array.from(projectSet).sort(),
      months: Array.from(monthSet).sort(),
      statuses: Array.from(statusSet).sort()
    };
  }, [tasks]);

  // Available columns configuration
  const columns = [
    { id: 'taskId', label: 'Task ID' },
    { id: 'taskType', label: 'Type' },
    { id: 'description', label: 'Description' },
    { id: 'totalHours', label: 'Total Hours' },
    { id: 'approvedHours', label: 'Approved Hours' },
    { id: 'project', label: 'Project' },
    { id: 'month', label: 'Month' },
    { id: 'status', label: 'Status' },
    { id: 'note', label: 'Note' },
    { id: 'actions', label: 'Actions' }
  ];

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId as keyof typeof prev]
    }));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Close filter dropdown if open and click is outside
      if (isFilterOpen && filterRef.current && !filterRef.current.contains(target)) {
        setIsFilterOpen(false);
        setHoveredFilter(null);
      }

      // Close column menu if open and click is outside
      if (isColumnMenuOpen && columnMenuRef.current && !columnMenuRef.current.contains(target)) {
        setIsColumnMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen, isColumnMenuOpen]);

  // Filter tasks based on active filters and search
  const filterTasks = useCallback(() => {
    return tasks.filter(task => {
      // Apply search filter if there's a search term
      const hasSearchTerm = filters.search.trim().length > 0;
      const searchTerm = filters.search.toLowerCase().trim();
      const matchesSearch = !hasSearchTerm ||
        task.taskId.toLowerCase().includes(searchTerm) ||
        task.taskType.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm) ||
        task.project.toLowerCase().includes(searchTerm) ||
        (task.note && task.note.toLowerCase().includes(searchTerm));

      // Apply active filters
      const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
        if (!value || value === 'All') return true;
        const taskValue = task[key as keyof Task];
        return taskValue?.toString().toLowerCase() === value.toLowerCase();
      });

      return matchesSearch && matchesFilters;
    });
  }, [tasks, filters.search, activeFilters]);

  // Update filtered tasks when filters or tasks change
  useEffect(() => {
    setFilteredTasks(filterTasks());
  }, [filterTasks]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (value === 'All' || value === '') {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });

    // Don't close the dropdown immediately, let user select multiple filters
    // Only close if this is not a submenu interaction
    if (key === 'search') {
      setIsFilterOpen(false);
      setHoveredFilter(null);
    }
  };

  const clearFilter = (key: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete (newFilters as any)[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setFilters(prev => ({ ...prev, search: '' }));
    if (onFilterChange) onFilterChange('');
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || Boolean(filters.search);

  const showNoResults = filteredTasks.length === 0 && (hasActiveFilters || tasks.length > 0);

  if (showNoResults) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No tasks found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No tasks match your search criteria. Try adjusting your filters or search query.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setFilters(prev => ({
                ...prev,
                month: 'All Months',
                search: ''
              }));
            }}
          >
            Clear all filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return null;
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('search', e.target.value);
  };

  const clearSearch = () => {
    handleFilterChange('search', '');
  };



  interface FilterOption {
    id: keyof Omit<Filters, 'search'>;
    label: string;
    options: string[];
    icon: React.ReactNode;
  }

  const filterOptions: FilterOption[] = [
    {
      id: 'taskType',
      label: 'Type',
      options: taskTypes,
      icon: <span className="w-4 h-4 mr-2">T</span>
    },
    {
      id: 'project',
      label: 'Project',
      options: projects,
      icon: <span className="w-4 h-4 mr-2">P</span>
    },
    {
      id: 'month',
      label: 'Month',
      options: months,
      icon: <span className="w-4 h-4 mr-2">M</span>
    },
    {
      id: 'status',
      label: 'Status',
      options: statuses,
      icon: <span className="w-4 h-4 mr-2">S</span>
    }
  ];

  // Render table header based on visible columns
  const renderTableHeader = () => (
    <TableHeader>
      <TableRow>
        {visibleColumns.taskId && <TableHead>Task ID</TableHead>}
        {visibleColumns.taskType && <TableHead>Type</TableHead>}
        {visibleColumns.description && <TableHead>Description</TableHead>}
        {visibleColumns.totalHours && <TableHead>Total Hours</TableHead>}
        {visibleColumns.approvedHours && <TableHead>Approved Hours</TableHead>}
        {visibleColumns.project && <TableHead>Project</TableHead>}
        {visibleColumns.month && <TableHead>Month</TableHead>}
        {visibleColumns.status && <TableHead>Status</TableHead>}
        {visibleColumns.note && <TableHead>Note</TableHead>}
        {visibleColumns.actions && <TableHead className="w-24">Actions</TableHead>}
      </TableRow>
    </TableHeader>
  );

  const renderTaskRow = (task: Task) => {
    return (
      <TableRow key={task.taskId}>
        <TableCell className="font-medium">{task.taskId}</TableCell>
        <TableCell>{task.taskType}</TableCell>
        <TableCell>{task.description}</TableCell>
        <TableCell>{task.totalHours}</TableCell>
        <TableCell>{task.approvedHours}</TableCell>
        <TableCell>{task.project}</TableCell>
        <TableCell>{task.month}</TableCell>
        <TableCell>
          <Badge variant={task.status === 'done' ? 'default' : 'secondary'}>
            {task.status}
          </Badge>
        </TableCell>
        <TableCell>{task.note || '-'}</TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditTask(task)}
              className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
              title="Edit task"
              type="button"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteTask(task.taskId)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              title="Delete task"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <div className="w-full h-full p-4 space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Task List</h2>

            <div className="flex items-center space-x-3">
              <div className="relative z-10" ref={filterRef} style={{ minWidth: 'fit-content' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2"
                >
                  <FilterIcon className="h-4 w-4" />
                  <span>Filters</span>
                  {Object.keys(activeFilters).length > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {Object.keys(activeFilters).length}
                    </span>
                  )}
                </Button>
                {isFilterOpen && (
                  <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50" style={{ minWidth: '14rem' }}>
                    <div className="p-1.5 space-y-0.5">
                      {filterOptions.map((filter) => (
                        <div
                          key={filter.id}
                          className="relative"
                          onMouseEnter={() => setHoveredFilter(filter.id)}
                          onMouseLeave={() => setHoveredFilter(null)}
                        >
                          <button
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left rounded-md transition-colors",
                              "hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-50",
                              hoveredFilter === filter.id ? "bg-gray-50" : ""
                            )}
                          >
                            <div className="flex items-center">
                              <span className="inline-flex items-center justify-center w-5 h-5 mr-2 text-xs font-medium text-gray-500">
                                {filter.icon}
                              </span>
                              <span className="font-medium text-gray-800">{filter.label}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </button>

                          {/* Submenu */}
                          {hoveredFilter === filter.id && (
                            <div
                              className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 z-[60] overflow-y-auto max-h-[400px] w-56 grid grid-cols-1 gap-2 p-2"
                              style={{
                                // Ensure it stays within viewport
                                maxWidth: 'calc(100vw - 2rem)'
                              }}
                            >
                              <div className="py-1.5">
                                <button
                                  onClick={() => handleFilterChange(filter.id, 'All')}
                                  className={cn(
                                    "w-full flex items-center px-4 py-2.5 text-sm text-left transition-colors",
                                    "hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-50",
                                    !activeFilters[filter.id] ? "bg-gray-50 font-semibold text-primary" : "text-gray-700"
                                  )}
                                >
                                  <span className="w-5 h-5 flex items-center justify-center mr-2">
                                    {!activeFilters[filter.id] && <Check className="h-3.5 w-3.5" />}
                                  </span>
                                  <span>All {filter.label}s</span>
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                {filter.options.map((option) => (
                                  <button
                                    key={option}
                                    onClick={() => handleFilterChange(filter.id, option)}
                                    className={cn(
                                      "w-full flex items-center px-4 py-2.5 text-sm text-left transition-colors",
                                      "hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-50",
                                      activeFilters[filter.id] === option
                                        ? "bg-blue-50 text-primary font-medium"
                                        : "text-gray-700 hover:text-gray-900"
                                    )}
                                  >
                                    <span className="w-5 h-5 flex items-center justify-center mr-2">
                                      {activeFilters[filter.id] === option && (
                                        <Check className="h-3.5 w-3.5" />
                                      )}
                                    </span>
                                    <span className="truncate">{option}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Customize Columns Button */}
              <div className="relative z-10" ref={columnMenuRef} style={{ position: 'relative', minWidth: 'fit-content' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                  className="flex items-center gap-2"
                >
                  <Columns className="h-4 w-4" />
                  <span>Customize Columns</span>
                </Button>

                {/* Columns Dropdown */}
                {isColumnMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-visible z-50" style={{ minWidth: '14rem' }}>
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm font-medium text-gray-700">Visible Columns</div>
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {columns.map((column) => (
                          <div key={column.id} className="flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-50 rounded">
                            <Checkbox
                              id={`col-${column.id}`}
                              checked={visibleColumns[column.id as keyof typeof visibleColumns]}
                              onCheckedChange={() => toggleColumn(column.id)}
                              className="h-4 w-4"
                            />
                            <Label
                              htmlFor={`col-${column.id}`}
                              className="text-sm font-normal cursor-pointer select-none"
                            >
                              {column.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search tasks..."
                className="pl-10 pr-8 py-2 w-full"
                value={filters.search}
                onChange={handleSearchChange}
              />
              {filters.search && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {Object.entries(activeFilters).map(([key, value]) => (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1 text-sm font-normal"
              >
                <span>{key}: {value}</span>
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1 text-sm font-normal">
                <span>Search: {filters.search}</span>
                <button
                  onClick={clearSearch}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto sm:overflow-visible">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mx-4 my-4">
          <Table className="w-full border-collapse">
            {renderTableHeader()}
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, index) => (
                  <TableRow
                    key={task.taskId}
                    className={`border-b border-gray-200 dark:border-gray-600 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                  >
                    {visibleColumns.taskId && <TableCell className="font-medium">{task.taskId}</TableCell>}
                    {visibleColumns.taskType && <TableCell>{task.taskType}</TableCell>}
                    {visibleColumns.description && <TableCell className="max-w-xs truncate">{task.description}</TableCell>}
                    {visibleColumns.totalHours && <TableCell>{task.totalHours}</TableCell>}
                    {visibleColumns.approvedHours && <TableCell>{task.approvedHours}</TableCell>}
                    {visibleColumns.project && <TableCell>{task.project}</TableCell>}
                    {visibleColumns.month && <TableCell>{task.month}</TableCell>}
                    {visibleColumns.status && (
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'todo' ? 'bg-yellow-100 text-yellow-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                          }`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </TableCell>
                    )}
                    {visibleColumns.note && <TableCell className="max-w-xs truncate">{task.note || '-'}</TableCell>}
                    {visibleColumns.actions && (
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditTask(task)}
                            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                            title="Edit task"
                            type="button"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteTask(task.taskId)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            title="Delete task"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={Object.values(visibleColumns).filter(Boolean).length}
                    className="h-24 text-center"
                  >
                    No tasks found. Try adjusting your filters or add a new task.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>

  );
};
