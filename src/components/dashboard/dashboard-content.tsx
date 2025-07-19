'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TaskForm } from '@/components/task-form'
import { TaskList } from '@/components/task-list'
import { Navbar } from '@/components/navbar'
import { Plus, X, FolderOpen } from 'lucide-react'
import { exportDashboardAndAnalyticsToExcel } from '@/lib/export/excel';
import { testTasks, testLeaves } from '@/lib/analytics/test-data';
import { useProductivityMetrics } from '@/hooks/useProductivityMetrics';
import { format } from 'date-fns';

interface Task {
  taskId: string
  taskType: string
  description: string
  totalHours: number
  approvedHours: number
  project: string
  month: string
  note?: string
  status: 'todo' | 'in-progress' | 'done'
  completed: boolean
}

/**
 * Dashboard content component
 * Contains the main task management interface
 */
interface Project {
  id: string;
  name: string;
  status: string;
  color: string;
}

export function DashboardContent() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      taskId: 'TASK-001',
      taskType: 'Development',
      description: 'Implement user authentication system',
      totalHours: 16,
      approvedHours: 20,
      project: 'Project Alpha',
      month: 'July',
      note: 'Need to implement JWT token refresh',
      status: 'in-progress',
      completed: false,
    },
    {
      taskId: 'TASK-002',
      taskType: 'Bug Fix',
      description: 'Fix login page responsiveness',
      totalHours: 2,
      approvedHours: 2,
      project: 'Project Alpha',
      month: 'July',
      note: 'Test on mobile devices',
      status: 'todo',
      completed: false,
    },
    {
      taskId: 'TASK-003',
      taskType: 'Design',
      description: 'Create new dashboard layout',
      totalHours: 8,
      approvedHours: 8,
      project: 'Project Beta',
      month: 'June',
      note: 'Use Tailwind CSS',
      status: 'done',
      completed: true,
    },
    {
      taskId: 'TASK-004',
      taskType: 'Development',
      description: 'Implement user authentication system',
      totalHours: 16,
      approvedHours: 20,
      project: 'Project Alpha',
      month: 'July',
      note: 'Need to implement JWT token refresh',
      status: 'in-progress',
      completed: false,
    },
    {
      taskId: 'TASK-005',
      taskType: 'Bug Fix',
      description: 'Fix login',
      totalHours: 2,
      approvedHours: 2,
      project: 'Project Gamma',
      month: 'July',
      note: 'Test on mobile devices',
      status: 'todo',
      completed: false,
    },
  ])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects')
    if (savedProjects) {
      try {
        const projectsData = JSON.parse(savedProjects)
        setProjects(projectsData)
      } catch (e) {
        console.error('Failed to parse saved projects', e)
      }
    }
  }, [])

  // Filter tasks based on selected project
  useEffect(() => {
    if (selectedProject === 'all') {
      setFilteredTasks(tasks)
    } else {
      const filtered = tasks.filter(task => task.project === selectedProject)
      setFilteredTasks(filtered)
    }
  }, [tasks, selectedProject])

  const addTask = (taskData: Omit<Task, 'taskId' | 'completed'>) => {
    const newTask: Task = {
      taskId: `TASK-${Math.floor(1000 + Math.random() * 9000)}`, // Generate a random task ID
      ...taskData,
      completed: false,
    }
    setTasks([...tasks, newTask])
    setIsModalOpen(false) // Close modal after adding task
  }

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task: Task) =>
        task.taskId === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter((task) => task.taskId !== taskId))
    }
  }

  const handleEditTask = (taskToEdit: Task) => {
    setCurrentTask(taskToEdit)
    setIsModalOpen(true)
  }

  // Prepare analytics data for export
  const currentMonth = format(new Date(), 'MMMM');
  const analyticsTasks = testTasks.filter(task => task.month.toLowerCase() === currentMonth.toLowerCase());
  const metrics = useProductivityMetrics(analyticsTasks);
  const trends: any[] = [];
  // Optionally, you can generate trends as in analytics page
  const analyticsData = {
    metrics,
    trends,
    leaves: testLeaves,
  };

  const handleExport = async () => {
    await exportDashboardAndAnalyticsToExcel(tasks, analyticsData);
  };

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
                    <SelectItem key={project.id} value={project.name}>
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
                    setCurrentTask(null)
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
                  onSubmit={(taskData) => {
                    if (currentTask) {
                      setTasks(
                        tasks.map((t) =>
                          t.taskId === currentTask.taskId
                            ? {
                                ...taskData,
                                taskId: currentTask.taskId,
                                completed: t.completed,
                              }
                            : t
                        )
                      );
                    } else {
                      setTasks([
                        ...tasks,
                        {
                          ...taskData,
                          taskId: `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
                          completed: false,
                        },
                      ]);
                    }
                    setIsModalOpen(false);
                    setCurrentTask(null);
                  }}
                  onCancel={() => {
                    setIsModalOpen(false);
                    setCurrentTask(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm" style={{ minHeight: 'unset' }}>
          <div className="overflow-x-auto w-full">
            <TaskList
              tasks={filteredTasks}
              onToggleTask={toggleTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
            />
          </div>
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