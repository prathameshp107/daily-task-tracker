'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { TaskForm } from '@/components/task-form'
import { TaskList } from '@/components/task-list'
import { Navbar } from '@/components/navbar'
import { Plus, X } from 'lucide-react'

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-7xl w-full mx-auto">
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
              <div className="mb-2">
                <h2 className="text-2xl font-bold">
                  {currentTask ? 'Edit Task' : 'Add New Task'}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {currentTask
                    ? 'Update the details of your task below.'
                    : 'Fill in the details to add a new task to your tracker.'}
                </p>
              </div>
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
                    )
                  } else {
                    setTasks([
                      ...tasks,
                      {
                        ...taskData,
                        taskId: `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
                        completed: false,
                      },
                    ])
                  }
                  setIsModalOpen(false)
                  setCurrentTask(null)
                }}
                onCancel={() => {
                  setIsModalOpen(false)
                  setCurrentTask(null)
                }}
                autoFocusFirst
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <TaskList
            tasks={tasks}
            onToggleTask={toggleTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {tasks.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-lg">No tasks yet</h3>
              <p>Get started by creating a new task</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first task
              </Button>
            </div>
          ) : (
            <p>
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} in total
            </p>
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
  )
}