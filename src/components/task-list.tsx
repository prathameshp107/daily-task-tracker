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
import { Check, CheckCircle2, ChevronDown, ChevronRight, Circle, Columns, Filter as FilterIcon, Loader2, Pencil, Plus, Search, Trash2, X, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Task, TaskStatus, isLegacyTask } from "@/lib/types";

// For backward compatibility with components expecting the old Task type
type LegacyTask = {
  taskId: string;
  taskType: string;
  description: string;
  totalHours: number;
  approvedHours: number;
  project: string;
  month: string;
  note?: string;
  status: TaskStatus;
  completed: boolean;
};

interface TaskListProps {
  tasks: (Task | LegacyTask)[];
  projects: any[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task | LegacyTask) => void;
  onFilterChange?: (filter: string) => void;
  loading?: boolean;
  error?: string | null;
}

interface Filters {
  search: string;
  month: string;
  project: string;
  status: string;
  taskType: string;
  taskId: string;
}

interface VisibleColumns {
  taskNumber: boolean;
  taskLink: boolean;
  taskType: boolean;
  description: boolean;
  totalHours: boolean;
  approvedHours: boolean;
  project: boolean;
  month: boolean;
  status: boolean;
  note: boolean;
  actions: boolean;
}

const allMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Utility function to get task properties, handling both Task and LegacyTask types
const getTaskProperties = (task: Task | LegacyTask) => {
  // For LegacyTask, map to common format
  if (isLegacyTask(task)) {
    return {
      id: task.taskId,
      _id: task.taskId,
      title: task.description,
      description: task.description,
      type: task.taskType,
      taskType: task.taskType,
      totalHours: task.totalHours,
      estimatedHours: task.totalHours, // Map to estimatedHours for consistency
      approvedHours: task.approvedHours,
      actualHours: task.approvedHours, // Map approvedHours to actualHours
      project: task.project,
      projectName: task.project, // Add projectName for consistency
      projectId: '',
      month: task.month,
      status: task.status,
      note: task.note || '',
      completed: task.completed,
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      taskNumber: (task as any).taskNumber || '' // Add taskNumber for LegacyTask
    };
  }
  
  // For Task type, handle both direct properties and nested properties
  const projectName = 'project' in task && typeof task.project === 'string' 
    ? task.project 
    : 'projectName' in task 
      ? (task as Task & { projectName?: string }).projectName 
      : (task as Task & { project?: { name?: string } }).project?.name || '';
      
  const projectId = 'projectId' in task 
    ? task.projectId 
    : (task as Task & { project?: { _id?: string } }).project?._id || '';
  
  const dueDate = 'dueDate' in task && task.dueDate ? new Date(task.dueDate) : new Date();
  const month = 'month' in task && task.month ? task.month : 
               dueDate.toLocaleString('default', { month: 'long' });
  
  const taskType = 'type' in task ? task.type : 
                  'taskType' in task ? (task as Task & { taskType?: string }).taskType : 
                  (task as Task & { labels?: string[] }).labels?.[0] || 'Task';
  const totalHours = task.estimatedHours || (task as Task & { totalHours?: number }).totalHours || 0;
  const approvedHours = task.actualHours || (task as Task & { approvedHours?: number }).approvedHours || 0;
  const taskId = (task as Task & { _id?: string; id?: string })._id || (task as Task & { _id?: string; id?: string }).id || '';
  
  // Create a new object with all the properties we need
  return {
    id: taskId,
    _id: taskId,
    title: task.title || '',
    description: task.description || '',
    type: taskType,
    taskType: taskType,
    totalHours: totalHours,
    estimatedHours: totalHours,
    approvedHours: approvedHours,
    actualHours: approvedHours,
    project: projectName,
    projectName: projectName,
    projectId: projectId,
    month: month,
    status: task.status || 'pending',
    note: (task as Task & { note?: string }).note || task.description || '',
    completed: task.completed || false,
    dueDate: task.dueDate || dueDate.toISOString(),
    createdAt: (task as Task & { createdAt?: string }).createdAt || new Date().toISOString(),
    updatedAt: (task as Task & { updatedAt?: string }).updatedAt || new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    taskNumber: (task as any).taskNumber || '' // Add taskNumber for Task
  };
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  projects,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onFilterChange,
  loading = false,
  error = null,
}) => {
  // Initialize filter state with all required properties
  const [filters, setFilters] = useState<Filters>({
    search: '',
    month: '',
    project: '',
    status: '',
    taskType: '',
    taskId: ''
  });

  // Track active filters to show in the UI
  const [activeFilters, setActiveFilters] = useState<Partial<Filters>>({});
  
  // Track filter dropdown state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);
  
  // Track column visibility
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    taskNumber: true,
    taskLink: true,
    taskType: true,
    description: true,
    totalHours: true,
    approvedHours: true,
    project: true,
    month: true,
    status: true,
    note: false,
    actions: true
  });

  // Refs
  const filterRef = useRef<HTMLDivElement>(null);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  
  // Memoized filtered tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter((task) => {
      const props = getTaskProperties(task);
      
      // Apply search filter
      if (filters.search && !props.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Apply other filters
      for (const [key, value] of Object.entries(filters)) {
        if (key !== 'search' && value && props[key as keyof typeof props] !== value) {
          return false;
        }
      }
      
      return true;
    });
  }, [tasks, filters]);

  // Get unique values for filter dropdowns
  const { taskTypes, projects: allProjects, months, statuses } = useMemo(() => {
    const typeSet = new Set<string>();
    const projectSet = new Set<string>();
    const monthSet = new Set<string>();
    const statusSet = new Set<string>();

    tasks.forEach(task => {
      const props = getTaskProperties(task);
      if (props.type) typeSet.add(props.type);
      if (props.project) projectSet.add(props.project);
      if (props.month) monthSet.add(props.month);
      if (props.status) statusSet.add(props.status);
    });

    return {
      taskTypes: Array.from(typeSet).sort(),
      projects: Array.from(projectSet).sort(),
      months: Array.from(monthSet).sort(),
      statuses: Array.from(statusSet).sort(),
    };
  }, [tasks]);

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    
    setFilters(newFilters);
    
    // Update active filters (only include non-empty filters)
    const newActiveFilters = Object.entries(newFilters).reduce((acc, [k, v]) => {
      if (v && k !== 'search') { // Don't include empty filters or search in active filters
        acc[k as keyof Filters] = v;
      }
      return acc;
    }, {} as Partial<Filters>);
    
    setActiveFilters(newActiveFilters);
    
    // Notify parent component if needed
    if (onFilterChange) {
      onFilterChange(JSON.stringify(newActiveFilters));
    }
  };

  const clearFilter = (key: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete (newFilters as Record<string, unknown>)[key];
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
      options: allProjects,
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
        {visibleColumns.taskNumber && <TableHead>Task Number</TableHead>}
        {visibleColumns.taskLink && <TableHead>Task Link</TableHead>}
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

  const renderTaskRows = useCallback(() => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={10} className="text-center py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading tasks...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={10} className="text-center py-8 text-red-600 dark:text-red-400">
            {error}
          </TableCell>
        </TableRow>
      );
    }

    if (filteredTasks.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center py-8 text-muted-foreground">
            No tasks found. Try adjusting your filters or create a new task.
          </TableCell>
        </TableRow>
      );
    }

    return filteredTasks.map((task) => {
      const taskProps = getTaskProperties(task);
      const {
        id,
        title,
        description,
        project,
        type,
        totalHours,
        approvedHours,
        month,
        status,
        completed,
        note
      } = taskProps;

    return (
        <TableRow key={id}>
          {visibleColumns.taskNumber && <TableCell className="font-medium">{taskProps.taskNumber}</TableCell>}
          {visibleColumns.taskLink && (
            <TableCell>
              {(() => {
                const projectObj = projects.find(p => p._id === taskProps.projectId);
                const jiraUrl = projectObj?.integrations?.jira?.url;
                const jiraKey = projectObj?.integrations?.jira?.projectKey;
                const taskNumber = taskProps.taskNumber;
                if (jiraUrl && jiraKey && taskNumber) {
                  const jiraLink = `${jiraUrl.replace(/\/$/, '')}/${jiraKey}-${taskNumber}`;
                  return (
                    <a href={jiraLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{taskNumber}</a>
                  );
                }
                // Fallback: default link
                return (
                  <a href={`/tasks/${id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{taskNumber}</a>
                );
              })()}
            </TableCell>
          )}
          {visibleColumns.taskType && <TableCell>{type}</TableCell>}
          {visibleColumns.description && <TableCell className="max-w-xs truncate">{description}</TableCell>}
          {visibleColumns.totalHours && <TableCell>{totalHours}</TableCell>}
          {visibleColumns.approvedHours && <TableCell>{approvedHours}</TableCell>}
          {visibleColumns.project && <TableCell>{project}</TableCell>}
          {visibleColumns.month && <TableCell>{month}</TableCell>}
          {visibleColumns.status && (
        <TableCell>
              <span className={`px-2 py-1 text-xs rounded-full ${status === 'todo' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                }`}>
                {status.replace('-', ' ')}
              </span>
        </TableCell>
          )}
          {visibleColumns.note && <TableCell className="max-w-xs truncate">{note || '-'}</TableCell>}
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
                  onClick={() => onDeleteTask(id)}
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
      );
    });
  }, [filteredTasks, visibleColumns, onEditTask, onDeleteTask, loading, error, projects]);

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

  return (
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
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md"
                              >
                                All {filter.label}s
                              </button>
                            </div>
                            {filter.options.map((option) => (
                              <div key={option} className="py-1.5">
                                <button
                                  onClick={() => handleFilterChange(filter.id, option)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md"
                                >
                                  {option}
                                </button>
                              </div>
                            ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                  <Columns className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(visibleColumns).map(([key, value]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={value}
                    onCheckedChange={(checked) =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [key]: checked,
                      }))
                    }
                  >
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({
                  search: '',
                  month: '',
                  project: '',
                  status: '',
                  taskType: '',
                  taskId: ''
                });
                setVisibleColumns({
                  taskNumber: true,
                  taskLink: true,
                  taskType: true,
                  description: true,
                  totalHours: true,
                  approvedHours: true,
                  project: true,
                  month: true,
                  status: true,
                  note: false,
                  actions: true,
                });
              }}
              className="h-8"
            >
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
            {renderTableHeader()}
            <TableBody>
            {renderTaskRows()}
            </TableBody>
          </Table>
        </div>
      </div>
  );
};

export default TaskList;
