'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TaskList from '@/components/task-list';
import { Navbar } from '@/components/navbar';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { Download, RefreshCw, FolderOpen, Loader2, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Task, Project } from '@/lib/types';
import { createAutoFetchTasksService, AutoFetchTask } from '@/lib/services/autofetchtasks.service';
import { projectService } from '@/lib/services';

// Convert AutoFetchTask to Task format for UI compatibility
const convertAutoFetchTaskToTask = (redmineIssue: any): Task => {
  // Helper function to get month from date string
  const getMonthFromDate = (dateString: string | null): string => {
    if (!dateString) {
      return new Date().toLocaleString('default', { month: 'long' });
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleString('default', { month: 'long' });
    } catch (error) {
      return new Date().toLocaleString('default', { month: 'long' });
    }
  };

  // Helper function to get approved hours from custom fields
  const getApprovedHours = (customFields: any[]): number => {
    if (!customFields || !Array.isArray(customFields)) return 0;
    
    const approvedHoursField = customFields.find(field => 
      field.name === 'Approved hours' || field.id === 21
    );
    
    if (approvedHoursField && approvedHoursField.value) {
      const hours = parseFloat(approvedHoursField.value);
      return isNaN(hours) ? 0 : hours;
    }
    
    return 0;
  };

  // Map Redmine status to task status
  const mapStatus = (redmineStatus: any): string => {
    if (!redmineStatus) return 'pending';
    
    const statusName = redmineStatus.name.toLowerCase();
    
    if (redmineStatus.is_closed || statusName.includes('done') || statusName.includes('closed')) {
      return 'completed';
    }
    
    if (statusName.includes('progress') || statusName.includes('development') || statusName.includes('review')) {
      return 'in-progress';
    }
    
    return 'pending';
  };

  return {
    _id: redmineIssue.id.toString(),
    id: redmineIssue.id.toString(),
    title: redmineIssue.subject,
    description: redmineIssue.description || redmineIssue.subject,
    projectId: redmineIssue.project.id.toString(),
    project: redmineIssue.project.name,
    status: mapStatus(redmineIssue.status),
    
    // Map according to your specifications:
    type: redmineIssue.tracker?.name || 'Task', // issue.tracker.name
    totalHours: redmineIssue.spent_hours || 0, // issue.spent_hours
    approvedHours: getApprovedHours(redmineIssue.custom_fields), // from custom_fields where name="Approved hours"
    month: getMonthFromDate(redmineIssue.start_date), // extract month from start_date
    
    note: redmineIssue.notes || '',
    dueDate: redmineIssue.due_date || '',
    estimatedHours: redmineIssue.estimated_hours || 0,
    actualHours: redmineIssue.spent_hours || 0,
    labels: [],
    priority: redmineIssue.priority?.name.toLowerCase() as 'low' | 'medium' | 'high' || 'medium',
    assigneeId: redmineIssue.assigned_to?.id.toString() || '',
    reporterId: redmineIssue.author?.id.toString() || '',
    createdAt: redmineIssue.created_on,
    updatedAt: redmineIssue.updated_on,
    completed: redmineIssue.status?.is_closed || false,
    assignedTo: redmineIssue.assigned_to?.name || '',
    taskNumber: redmineIssue.id.toString(),
  };
};

export function AutoFetchDashboardContent() {
  const { toast } = useToast();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [redmineProjects, setRedmineProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectsData = await projectService.getProjects();
        setProjects(projectsData);
        
        // Filter projects that have Redmine integration configured
        const redmineConfiguredProjects = projectsData.filter(project => 
          project.integrations?.redmine?.url && 
          project.integrations?.redmine?.apiKey &&
          project.integrations?.redmine?.projectId &&
          project.integrations?.redmine?.username
        );
        setRedmineProjects(redmineConfiguredProjects);

        // Auto-fetch tasks from all configured Redmine projects
        await fetchAllRedmineTasks(redmineConfiguredProjects);
        
      } catch (err: unknown) {
        console.error('Failed to fetch data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter tasks when project or month selection changes
  useEffect(() => {
    let filtered = tasks;

    // Filter by project
    if (selectedProject !== 'all') {
      filtered = filtered.filter(task => task.projectId === selectedProject);
    }

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(task => {
        const taskMonth = task.month || new Date().toLocaleString('default', { month: 'long' });
        return taskMonth === selectedMonth;
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedProject, selectedMonth]);

  const fetchAllRedmineTasks = async (redmineConfiguredProjects: Project[]) => {
    if (redmineConfiguredProjects.length === 0) {
      setError('No Redmine integrations configured. Please configure Redmine integration in Settings.');
      return;
    }

    try {
      setFetching(true);
      setError(null);
      let allTasks: Task[] = [];

      for (const project of redmineConfiguredProjects) {
        const redmineConfig = project.integrations?.redmine;
        if (!redmineConfig) continue;

        try {
          const autoFetchService = createAutoFetchTasksService(redmineConfig.url, redmineConfig.apiKey);
          const autoTasks = await autoFetchService.getTasks(redmineConfig.projectId, redmineConfig.username);
          
          // Convert Redmine issues to Task format
          const convertedTasks = autoTasks.map(convertAutoFetchTaskToTask);
          allTasks = [...allTasks, ...convertedTasks];
        } catch (projectError) {
          console.error(`Failed to fetch tasks for project ${project.name}:`, projectError);
          // Continue with other projects even if one fails
        }
      }

      setTasks(allTasks);

      if (allTasks.length > 0) {
        toast({
          title: 'Success',
          description: `Fetched ${allTasks.length} tasks from ${redmineConfiguredProjects.length} Redmine project(s)`,
        });
      }
    } catch (err: unknown) {
      console.error('Failed to fetch tasks from Redmine:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks from Redmine';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setFetching(false);
    }
  };

  const handleRefresh = () => {
    // Clear all Redmine service caches before refreshing
    const RedmineServiceManager = require('@/lib/services/redmine-service-manager').default;
    RedmineServiceManager.getInstance().clearAllCaches();
    
    fetchAllRedmineTasks(redmineProjects);
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
            <h1 className="text-2xl font-bold tracking-tight">Auto Fetch Tasks</h1>
            <p className="text-muted-foreground">
              Tasks automatically fetched from configured Redmine projects
            </p>
          </div>
          <Button 
            onClick={() => router.push('/settings?tab=integrations')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Configure Redmine
          </Button>
        </div>

        {/* Configuration Status */}
        {redmineProjects.length === 0 && (
          <div className="mb-6 p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <Settings className="h-5 w-5" />
              <h3 className="font-semibold">Redmine Configuration Required</h3>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 mt-1">
              No Redmine integrations are configured. Please go to Settings → Integrations to configure your Redmine connection.
            </p>
            <Button 
              onClick={() => router.push('/settings?tab=integrations')}
              className="mt-3"
              size="sm"
            >
              Configure Now
            </Button>
          </div>
        )}

        {redmineProjects.length > 0 && (
          <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <h3 className="font-semibold">Redmine Integration Active</h3>
                </div>
                <p className="text-green-700 dark:text-green-300 mt-1">
                  Connected to {redmineProjects.length} Redmine project(s): {redmineProjects.map(p => p.name).join(', ')}
                </p>
              </div>
              <Button 
                onClick={handleRefresh}
                disabled={fetching}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
                {fetching ? 'Fetching...' : 'Refresh'}
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Select 
                value={selectedMonth} 
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                onToggleTask={() => {}} // Read-only for auto-fetched tasks
                onDeleteTask={() => {}} // Read-only for auto-fetched tasks
                onEditTask={() => {}} // Read-only for auto-fetched tasks
                readOnly={true}
              />
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground" style={{ marginBottom: 0 }}>
          {filteredTasks.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
                <div className="relative rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-6 shadow-lg">
                  <Download className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="space-y-3 max-w-md">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {redmineProjects.length === 0 ? 'No Redmine Integration' : 'No tasks found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  {redmineProjects.length === 0 
                    ? 'Configure your Redmine integration in Settings to start auto-fetching tasks.'
                    : 'No tasks were found in your configured Redmine projects. Try refreshing or check your Redmine configuration.'
                  }
                </p>
              </div>

              {redmineProjects.length === 0 ? (
                <Button
                  onClick={() => router.push('/settings?tab=integrations')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Configure Redmine Integration
                </Button>
              ) : (
                <Button
                  onClick={handleRefresh}
                  disabled={fetching}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {fetching ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Fetching Tasks...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Refresh Tasks
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="py-6">
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-base font-medium">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} fetched from Redmine
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