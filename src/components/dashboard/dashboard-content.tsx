'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskForm } from '@/components/task-form';
import TaskList from '@/components/task-list';
import { Navbar } from '@/components/navbar';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { Plus, X, FolderOpen, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { taskService, projectService, leaveService } from '@/lib/services';
import { useProductivityMetrics } from '@/hooks/useProductivityMetrics';
import { useToast } from '@/components/ui/use-toast';
import { Task, Project, toLegacyTask, fromLegacyTask, LegacyTask } from '@/lib/types';

interface TaskFormData {
  taskId: string;
  taskType: string;
  description: string;
  totalHours: number;
  approvedHours: number;
  projectId: string; // <-- use projectId
  month: string;
  note: string;
  status: 'todo' | 'in-progress' | 'done';
  taskNumber: string; // Added taskNumber to the interface
}

const normalizeTask = (task: Partial<Task>): Task => ({
  _id: task._id || '',
  id: task.id || task._id || '',
  title: task.title || '',
  description: task.description || '',
  projectId: task.projectId || '',
  project: task.project || '',
  status: task.status || 'pending',
  type: task.type || '',
  totalHours: task.totalHours || 0,
  approvedHours: task.approvedHours || 0,
  month: task.month || '',
  note: task.note || '',
  dueDate: task.dueDate || '',
  estimatedHours: task.estimatedHours || 0,
  actualHours: task.actualHours || 0,
  labels: task.labels || [],
  priority: task.priority || 'medium',
  assigneeId: task.assigneeId || '',
  reporterId: task.reporterId || '',
  createdAt: task.createdAt || new Date().toISOString(),
  updatedAt: task.updatedAt || new Date().toISOString(),
  completed: task.completed || false,
  assignedTo: task.assignedTo || '',
  taskNumber: task.taskNumber || '',
});

// Type guards
export function isLegacyTask(task: unknown): task is LegacyTask {
  return typeof task === 'object' && task !== null && 'taskId' in task && 'taskType' in task;
}

export function isTask(task: unknown): task is Task {
  return typeof task === 'object' && task !== null && '_id' in task && 'title' in task && 'projectId' in task;
}

export function DashboardContent() {
  const { toast } = useToast();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [leaves, setLeaves] = useState<string[]>([]);

  // Convert tasks to analytics format for productivity metrics
  const analyticsTasksData = tasks.map(task => ({
    taskId: task._id || task.id || '',
    taskNumber: task.taskNumber || '',
    taskType: task.type || '',
    description: task.description || task.title || '',
    totalHours: task.estimatedHours || task.totalHours || 0,
    approvedHours: task.actualHours || task.approvedHours || 0,
    project: task.project || '',
    month: task.month || new Date().toLocaleString('default', { month: 'long' }),
    note: task.note || '',
    status: (task.status === 'pending' ? 'todo' : task.status === 'completed' ? 'done' : task.status) as 'todo' | 'in-progress' | 'done',
    completed: task.completed || false,
  }));

  // Calculate productivity metrics at component level
  const productivityMetrics = useProductivityMetrics(analyticsTasksData, leaves);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch tasks
        const tasksData = await taskService.getTasks({});
        setTasks(tasksData);

        // Fetch projects
        const projectsData = await projectService.getProjects();
        setProjects(projectsData);

        // Fetch leaves
        const leavesData = await leaveService.getLeaves();
        setLeaves(leavesData.map(leave => leave.date));

      } catch (err: unknown) {
        console.error('Failed to fetch data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });

        // Redirect to login if unauthorized
        if ((err as any)?.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, router]);

  // Filter tasks when project selection changes
  useEffect(() => {
    if (selectedProject === 'all') {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter(task => task.projectId === selectedProject);
      setFilteredTasks(filtered);
    }
  }, [tasks, selectedProject]);

  // Filter tasks based on selected project
  useEffect(() => {
    if (selectedProject === 'all') {
      setFilteredTasks(tasks)
    } else {
      const filtered = tasks.filter(task => task.projectId === selectedProject)
      setFilteredTasks(filtered)
    }
  }, [tasks, selectedProject])

  const addTask = async (taskData: TaskFormData) => {
    try {
      const selectedProjectObj = projects.find(p => p._id === taskData.projectId);
      const projectName = selectedProjectObj ? selectedProjectObj.name : '';
      const newTask = await taskService.createTask({
        title: taskData.description, // or taskData.title if available
        description: taskData.description,
        type: taskData.taskType,
        projectId: taskData.projectId,
        projectName, // <-- add projectName
        status:
          taskData.status === 'todo'
            ? 'pending'
            : taskData.status === 'done'
              ? 'completed'
              : taskData.status,
        totalHours: taskData.totalHours,
        approvedHours: taskData.approvedHours,
        note: taskData.note,
        month: taskData.month,
        date: new Date().toISOString().split('T')[0],
        completed: false,
        taskNumber: taskData.taskNumber, // <-- add this line
      });
      setTasks(prev => [...prev, normalizeTask(newTask)]);
      setSelectedProject('all');
      setIsModalOpen(false);
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    } catch (err: unknown) {
      console.error('Failed to create task:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create task. Please try again.',
      });
    }
  }

  const toggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;

      const updatedTask = await taskService.updateTask(taskId, {
        ...task,
        completed: !task.completed,
        status: !task.completed ? 'completed' : 'pending',
      });

      setTasks(tasks.map(t => t._id === taskId ? updatedTask : t));
    } catch (err: unknown) {
      console.error('Failed to update task:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
      });
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        setTasks(tasks.filter(task => task._id !== taskId));
        toast({
          title: 'Success',
          description: 'Task deleted successfully',
        });
      } catch (err: unknown) {
        console.error('Failed to delete task:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete task. Please try again.',
        });
      }
    }
  }

  const handleEditTask = (taskToEdit: Task | LegacyTask) => {
    if ('_id' in taskToEdit) {
      setCurrentTask(taskToEdit);
    }
    setIsModalOpen(true)
  }

  const handleExport = async () => {
    try {
      // Import the utility function to calculate metrics without using hooks
      const { calculateProductivityMetrics } = await import('@/lib/utils/productivity-metrics');
      
      // Get current month name to match the analytics page behavior
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      
      // Calculate metrics using the utility function with the current month
      const exportMetrics = calculateProductivityMetrics(analyticsTasksData, leaves, currentMonth);
      
      // Use the calculated metrics for export
      const analyticsData = {
        metrics: {
          totalTasks: exportMetrics.totalTasks,
          totalWorkingHours: exportMetrics.totalWorkingHours,
          totalApprovedHours: exportMetrics.totalApprovedHours,
          totalWorkingDaysInMonth: exportMetrics.totalWorkingDaysInMonth,
          totalLeaves: exportMetrics.totalLeaves,
          effectiveWorkingDays: exportMetrics.effectiveWorkingDays,
          productivity: exportMetrics.productivity,
          month: exportMetrics.month,
          year: exportMetrics.year,
        },
        trends: [],
        leaves: leaves,
      };

      // Import the export function dynamically
      const { exportDashboardAndAnalyticsToExcel } = await import('@/lib/export/excel');
      
      // Export with projects data for integration links
      await exportDashboardAndAnalyticsToExcel(analyticsTasksData, analyticsData, projects);
      
      toast({
        title: 'Export Successful',
        description: 'Tasks have been exported to Excel with integration links.',
      });
    } catch (err: unknown) {
      console.error('Export failed:', err);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to export tasks. Please try again.',
      });
    }
  };

  // Show skeleton while loading
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-7xl w-full mx-auto" style={{ minHeight: 'unset', paddingBottom: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Today's Tasks</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-gray-500" />
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExport} variant="outline">
              Export to Excel
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 px-4 py-2 text-sm font-medium rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                {/* Close button */}
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setCurrentTask(undefined)
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Close"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
                {/* Title and subtitle */}
                <DialogTitle className="text-2xl font-bold">
                  {currentTask ? 'Edit Task' : 'Add New Task'}
                </DialogTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  {currentTask
                    ? 'Update the details of your task below.'
                    : 'Fill in the details to add a new task to your tracker.'}
                </p>
                <hr className="my-4" />
                <TaskForm
                  task={currentTask}
                  onSubmit={async (taskData) => {
                    if (currentTask) {
                      // Update existing task
                      try {
                        const selectedProjectObj = projects.find(p => p._id === taskData.projectId);
                        const projectName = selectedProjectObj ? selectedProjectObj.name : '';
                        const updatedTask = await taskService.updateTask(currentTask._id, {
                          title: taskData.description, // or taskData.title if available
                          description: taskData.description,
                          type: taskData.taskType,
                          projectId: taskData.projectId,
                          projectName, // <-- always send this
                          status:
                            taskData.status === 'todo'
                              ? 'pending'
                              : taskData.status === 'done'
                                ? 'completed'
                                : taskData.status,
                          totalHours: taskData.totalHours,
                          approvedHours: taskData.approvedHours,
                          note: taskData.note,
                          month: taskData.month,
                          date: new Date().toISOString().split('T')[0],
                          completed: currentTask.completed,
                          taskNumber: currentTask.taskNumber,
                        });
                        
                        // Ensure the updated task has all necessary fields for UI display
                        const enhancedUpdatedTask = {
                          ...updatedTask,
                          project: projectName, // Ensure project name is set
                          projectName: projectName, // Ensure projectName is set
                          title: taskData.description,
                          description: taskData.description,
                          type: taskData.taskType,
                        };
                        
                        setTasks(prevTasks => prevTasks.map(t => t._id === currentTask._id ? enhancedUpdatedTask : t));
                        
                        // Also update filtered tasks if the current task is in the filtered view
                        setFilteredTasks(prevFilteredTasks => 
                          prevFilteredTasks.map(t => t._id === currentTask._id ? enhancedUpdatedTask : t)
                        );
                        
                        setIsModalOpen(false);
                        setCurrentTask(undefined);
                        toast({
                          title: 'Success',
                          description: 'Task updated successfully',
                        });
                      } catch (err: unknown) {
                        console.error('Failed to update task:', err);
                        toast({
                          variant: 'destructive',
                          title: 'Error',
                          description: 'Failed to update task. Please try again.',
                        });
                      }
                    } else {
                      // Create new task
                      await addTask(taskData);
                    }
                  }}
                  onCancel={() => {
                    setIsModalOpen(false);
                    setCurrentTask(undefined);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm" style={{ minHeight: 'unset' }}>
          {error ? (
            <div className="p-4 text-red-600 dark:text-red-400">{error}</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <TaskList
                tasks={filteredTasks}
                projects={projects}
                onToggleTask={toggleTask}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
              />
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground" style={{ marginBottom: 0 }}>
          {filteredTasks.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-6">
              {/* Enhanced Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
                <div className="relative rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-6 shadow-lg">
                  <Plus className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Enhanced Text Content */}
              <div className="space-y-3 max-w-md">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedProject === 'all' ? 'No tasks yet' : `No tasks for ${selectedProject}`}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  {selectedProject === 'all'
                    ? 'Ready to boost your productivity? Create your first task to get started with TaskFlow.'
                    : `No tasks found for ${selectedProject}. Create a new task or try selecting a different project.`
                  }
                </p>
              </div>

              {/* Enhanced Action Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Task
                </Button>
                {selectedProject !== 'all' && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProject('all')}
                    className="px-6 py-3 text-base font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    View All Tasks
                  </Button>
                )}
              </div>

              {/* Quick Tips */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-md">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  💡 Quick Tips
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left">
                  <li>• Use the form above to add detailed task information</li>
                  <li>• Assign tasks to specific projects for better organization</li>
                  <li>• Track your progress with status updates</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-6">
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-base font-medium">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                  {selectedProject !== 'all' ? ` for ${selectedProject}` : ''} in total
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="border-t border-t-gray-200 dark:border-t-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} TaskFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <span>Built with</span>
                <span className="font-medium">Next.js</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}