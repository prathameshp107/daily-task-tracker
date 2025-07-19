"use client"
import { ProjectsManagement } from '@/components/settings/projects-management'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FolderOpen, CheckSquare, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ProjectsPage() {
  const [projectCount, setProjectCount] = useState(0)
  const [taskCount, setTaskCount] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  const months = [
    { value: 'all', label: 'All Months' },
    { value: 'january', label: 'January' },
    { value: 'february', label: 'February' },
    { value: 'march', label: 'March' },
    { value: 'april', label: 'April' },
    { value: 'may', label: 'May' },
    { value: 'june', label: 'June' },
    { value: 'july', label: 'July' },
    { value: 'august', label: 'August' },
    { value: 'september', label: 'September' },
    { value: 'october', label: 'October' },
    { value: 'november', label: 'November' },
    { value: 'december', label: 'December' },
  ]

  // Fetch projects and tasks count
  useEffect(() => {
    // Get projects count from localStorage
    const savedProjects = localStorage.getItem('projects')
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects)
        setProjectCount(projects.length)
      } catch (e) {
        console.error('Failed to parse saved projects', e)
      }
    }

    // Get tasks count from localStorage
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      try {
        const tasks = JSON.parse(savedTasks)
        setTaskCount(tasks.length)
      } catch (e) {
        console.error('Failed to parse saved tasks', e)
      }
    }
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <FolderOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Projects
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                  Manage your projects, track progress, and configure integrations
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{projectCount}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Task Count</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{taskCount}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Project Management
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Create, edit, and manage your projects with full integration support
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ProjectsManagement selectedMonth={selectedMonth} />
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
} 