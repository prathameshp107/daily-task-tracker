'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Settings, Shield, Zap, RefreshCw } from 'lucide-react';
import { projectService } from '@/lib/services';
import integrationService from '@/lib/services/integration.service';
import { Project } from '@/lib/types';
import { Form, FormItem, FormField, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const jiraSchema = z.object({
  // Required fields for basic integration
  url: z.string().url('Please enter a valid URL'),
  email: z.string().email('Please enter a valid email'),
  apiToken: z.string().min(1, 'API token is required'),
  projectKey: z.string().min(1, 'Project key is required'),
  syncEnabled: z.boolean(),
  
  // Optional fields for advanced/automated configuration
  autoSync: z.boolean().optional(),
  syncInterval: z.number().min(5).max(1440).optional(),
  autoAssignTasks: z.boolean().optional(),
  syncStatus: z.enum(['new', 'in-progress', 'done', 'all']).optional(),
  webhookUrl: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
  jqlFilter: z.string().optional(),
  assigneeFilter: z.enum(['current-user', 'all', 'unassigned']).optional(),
  syncComments: z.boolean().optional(),
  syncAttachments: z.boolean().optional(),
  lastSyncDate: z.string().optional(),
});

const redmineSchema = z.object({
  // Required fields for basic integration
  url: z.string().url('Please enter a valid URL'),
  apiKey: z.string().min(1, 'API key is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  syncEnabled: z.boolean(),
  
  // Optional fields for advanced/automated configuration
  autoSync: z.boolean().optional(),
  syncInterval: z.number().min(5).max(1440).optional(),
  autoAssignTasks: z.boolean().optional(),
  syncStatus: z.enum(['new', 'in-progress', 'closed', 'all']).optional(),
  webhookUrl: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
  trackerId: z.string().optional(),
  assigneeFilter: z.enum(['current-user', 'all', 'unassigned']).optional(),
  syncComments: z.boolean().optional(),
  syncAttachments: z.boolean().optional(),
  lastSyncDate: z.string().optional(),
});

type IntegrationType = 'jira' | 'redmine';

interface Integration {
  url: string;
  email?: string;
  apiToken?: string;
  apiKey?: string;
  projectKey?: string;
  projectId?: string;
  syncEnabled: boolean;
}

interface ProjectIntegrations {
  jira?: Integration;
  redmine?: Integration;
}

interface ProjectToolsIntegrationProps {
  isAutomated: boolean;
}

export function ProjectToolsIntegration({ isAutomated }: ProjectToolsIntegrationProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedProjectData, setSelectedProjectData] = useState<Project | null>(null);
  const [integrations, setIntegrations] = useState<ProjectIntegrations>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [integrationType, setIntegrationType] = useState<IntegrationType | null>(null);

  // Load projects and integrations from service
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const projectsData = await projectService.getProjects();
        setProjects(projectsData);

      } catch (err) {
        console.error('Failed to load data:', err);
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

    loadData();
  }, []);

  // Load project-specific integration settings when a project is selected
  useEffect(() => {
    const loadProjectIntegrations = async () => {
      if (!selectedProject) {
        setSelectedProjectData(null);
        setIntegrationType(null);
        return;
      }

      try {
        const project = projects.find(p => p._id === selectedProject);
        if (!project) return;

        setSelectedProjectData(project);

        // Determine integration type based on existing project data
        if (project.integrations?.jira?.url || project.integrations?.jira?.projectKey) {
          setIntegrationType('jira');
          // Load Jira integration data into form
          jiraForm.reset({
            url: project.integrations.jira.url || '',
            email: project.integrations.jira.email || '',
            apiToken: project.integrations.jira.apiToken || '',
            projectKey: project.integrations.jira.projectKey || '',
            syncEnabled: project.integrations.jira.syncEnabled ?? true,
            autoSync: project.integrations.jira.autoSync ?? false,
            syncInterval: project.integrations.jira.syncInterval ?? 30,
            autoAssignTasks: project.integrations.jira.autoAssignTasks ?? false,
            syncStatus: project.integrations.jira.syncStatus ?? 'all',
            webhookUrl: project.integrations.jira.webhookUrl || '',
            jqlFilter: project.integrations.jira.jqlFilter || '',
            assigneeFilter: project.integrations.jira.assigneeFilter ?? 'current-user',
            syncComments: project.integrations.jira.syncComments ?? false,
            syncAttachments: project.integrations.jira.syncAttachments ?? false,
            lastSyncDate: project.integrations.jira.lastSyncDate || '',
          });
        } else if (project.integrations?.redmine?.url || project.integrations?.redmine?.projectId) {
          setIntegrationType('redmine');
          // Load Redmine integration data into form
          redmineForm.reset({
            url: project.integrations.redmine.url || '',
            apiKey: project.integrations.redmine.apiKey || '',
            projectId: project.integrations.redmine.projectId || '',
            syncEnabled: project.integrations.redmine.syncEnabled ?? true,
            autoSync: project.integrations.redmine.autoSync ?? false,
            syncInterval: project.integrations.redmine.syncInterval ?? 30,
            autoAssignTasks: project.integrations.redmine.autoAssignTasks ?? false,
            syncStatus: project.integrations.redmine.syncStatus ?? 'all',
            webhookUrl: project.integrations.redmine.webhookUrl || '',
            trackerId: project.integrations.redmine.trackerId || '',
            assigneeFilter: project.integrations.redmine.assigneeFilter ?? 'current-user',
            syncComments: project.integrations.redmine.syncComments ?? false,
            syncAttachments: project.integrations.redmine.syncAttachments ?? false,
            lastSyncDate: project.integrations.redmine.lastSyncDate || '',
          });
        } else {
          // No integration configured, default to null (show selection)
          setIntegrationType(null);
        }
      } catch (err) {
        console.error('Failed to load project integrations:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load project integration settings.',
        });
      }
    };

    loadProjectIntegrations();
  }, [selectedProject, projects]);

  const saveIntegrationForProject = async (projectName: string, type: IntegrationType, config: any) => {
    try {
      const project = projects.find(p => p.name === projectName);
      if (!project) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Project not found.',
        });
        return;
      }

      await integrationService.updateProjectIntegrations(project._id, {
        [type]: config
      });

      setIntegrations(prev => ({
        ...prev,
        [type]: config
      }));

      toast({
        title: 'Success',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} integration saved for ${projectName}.`,
      });
    } catch (err) {
      console.error('Failed to save integration:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save integration. Please try again.',
      });
    }
  };

  const onJiraSubmit = (data: z.infer<typeof jiraSchema>) => {
    if (!selectedProject || !selectedProjectData) {
      toast({
        title: 'Select a project',
        description: 'Please select a project to save this integration.',
        variant: 'destructive',
      });
      return;
    }
    saveIntegrationForProject(selectedProjectData.name, 'jira', data);
  };

  const onRedmineSubmit = (data: z.infer<typeof redmineSchema>) => {
    if (!selectedProject || !selectedProjectData) {
      toast({
        title: 'Select a project',
        description: 'Please select a project to save this integration.',
        variant: 'destructive',
      });
      return;
    }
    saveIntegrationForProject(selectedProjectData.name, 'redmine', data);
  };

  // Jira Form
  const jiraForm = useForm<z.infer<typeof jiraSchema>>({
    resolver: zodResolver(jiraSchema),
    defaultValues: integrations.jira || {
      url: '',
      email: '',
      apiToken: '',
      projectKey: '',
      syncEnabled: true,
      autoSync: false,
      syncInterval: 30,
      autoAssignTasks: false,
      syncStatus: 'all',
      webhookUrl: '',
      jqlFilter: '',
      assigneeFilter: 'current-user',
      syncComments: false,
      syncAttachments: false,
      lastSyncDate: '',
    },
  });

  // Redmine Form
  const redmineForm = useForm<z.infer<typeof redmineSchema>>({
    resolver: zodResolver(redmineSchema),
    defaultValues: integrations.redmine || {
      url: '',
      apiKey: '',
      projectId: '',
      syncEnabled: true,
      autoSync: false,
      syncInterval: 30,
      autoAssignTasks: false,
      syncStatus: 'all',
      webhookUrl: '',
      trackerId: '',
      assigneeFilter: 'current-user',
      syncComments: false,
      syncAttachments: false,
      lastSyncDate: '',
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">
            Loading integration settings...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Integrations
        </h3>
        <p className="text-red-700 dark:text-red-300 mb-4">
          {error}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Project Selection */}
      <div className="w-full space-y-4 p-6 border rounded-lg bg-card">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Project Selection</h3>
          <p className="text-sm text-muted-foreground">
            Choose a project to configure its integration settings.
          </p>
        </div>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project-select">Project</Label>
            <Select 
              value={selectedProject} 
              onValueChange={setSelectedProject}
            >
              <SelectTrigger id="project-select" className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.length === 0 ? (
                  <SelectItem value="" disabled>No projects available</SelectItem>
                ) : (
                  projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Integration Status</Label>
            <div className="h-10 flex items-center">
              {!selectedProject ? (
                <div className="text-muted-foreground text-sm">
                  Select a project to view status
                </div>
              ) : integrationType === 'jira' ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium">Jira Integration Active</span>
                </div>
              ) : integrationType === 'redmine' ? (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                  <span className="text-sm font-medium">Redmine Integration Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2.5 h-2.5 bg-muted-foreground/40 rounded-full"></div>
                  <span className="text-sm">No integration configured</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Show integration forms only when a project is selected  */}
      {selectedProject && selectedProjectData && (
        <div className="space-y-8">
          {/* Show Jira Integration only if project has Jira configured or no integration */}
          {(integrationType === 'jira' || integrationType === null) && (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">J</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">Jira Integration</CardTitle>
                    <CardDescription className="text-sm">
                      Connect your Jira account to sync issues and track time.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...jiraForm}>
                  <form onSubmit={jiraForm.handleSubmit(onJiraSubmit)} className="space-y-6">

                    {/* Basic Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <Settings className="w-4 h-4 text-gray-600" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Basic Configuration</h4>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={jiraForm.control}
                            name="url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Jira URL</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://your-domain.atlassian.net"
                                    className="h-10"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={jiraForm.control}
                            name="projectKey"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Project Key</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="IAC"
                                    className="h-10"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Automated Configuration */}
                    {isAutomated && (
                      <>
                        {/* Authentication Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <Shield className="w-4 h-4 text-green-600" />
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Authentication</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={jiraForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">Email</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="your-email@example.com"
                                      type="email"
                                      className="h-10"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={jiraForm.control}
                              name="apiToken"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">API Token</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Your Jira API token"
                                      type="password"
                                      className="h-10"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Sync Settings */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <RefreshCw className="w-4 h-4 text-blue-600" />
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Sync Settings</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={jiraForm.control}
                              name="autoSync"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                                  <div className="space-y-1">
                                    <FormLabel className="text-sm font-medium">Enable Auto Sync</FormLabel>
                                    <p className="text-xs text-muted-foreground">Automatically fetch tasks</p>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={jiraForm.control}
                              name="syncInterval"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">Sync Interval (minutes)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="5"
                                      max="1440"
                                      placeholder="30"
                                      className="h-10"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">5-1440 minutes</p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={jiraForm.control}
                              name="syncStatus"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">Sync Task Status</FormLabel>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Tasks</SelectItem>
                                      <SelectItem value="new">New Tasks Only</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="done">Done Tasks</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={jiraForm.control}
                              name="assigneeFilter"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">Assignee Filter</FormLabel>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder="Select assignee filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="current-user">Current User Only</SelectItem>
                                      <SelectItem value="all">All Assignees</SelectItem>
                                      <SelectItem value="unassigned">Unassigned Only</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Advanced Options */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <Zap className="w-4 h-4 text-purple-600" />
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Advanced Options</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={jiraForm.control}
                              name="autoAssignTasks"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                                  <div className="space-y-1">
                                    <FormLabel className="text-sm font-medium">Auto Assign Tasks</FormLabel>
                                    <p className="text-xs text-muted-foreground">Assign to current user</p>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={jiraForm.control}
                              name="syncComments"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                                  <div className="space-y-1">
                                    <FormLabel className="text-sm font-medium">Sync Comments</FormLabel>
                                    <p className="text-xs text-muted-foreground">Include issue comments</p>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-4">
                            <FormField
                              control={jiraForm.control}
                              name="jqlFilter"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">JQL Filter (Optional)</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="project = IAC AND assignee = currentUser()"
                                      className="h-10"
                                      {...field}
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">Custom JQL query to filter issues</p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={jiraForm.control}
                              name="webhookUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">Webhook URL (Optional)</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://your-app.com/webhook/jira"
                                      className="h-10"
                                      {...field}
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">Receive real-time updates</p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="submit"
                        disabled={jiraForm.formState.isSubmitting}
                        className="min-w-[140px] h-10"
                      >
                        {jiraForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Settings'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Redmine Integration */}
          {(integrationType === 'redmine' || integrationType === null) && (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                    <span className="text-red-600 font-bold text-lg">R</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">Redmine Integration</CardTitle>
                    <CardDescription className="text-sm">
                      Connect your Redmine instance to track issues and time entries.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...redmineForm}>
                  <form onSubmit={redmineForm.handleSubmit(onRedmineSubmit)} className="space-y-6">

                    {/* Basic Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <Settings className="w-4 h-4 text-gray-600" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Basic Configuration</h4>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={redmineForm.control}
                            name="url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Redmine URL</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://redmine.example.com"
                                    className="h-10"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={redmineForm.control}
                            name="projectId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Project ID</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="api-improvement"
                                    className="h-10"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Automated Configuration */}
                    {isAutomated && (
                      <>
                        {/* Authentication Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <Shield className="w-4 h-4 text-green-600" />
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Authentication</h4>
                          </div>

                          <FormField
                            control={redmineForm.control}
                            name="apiKey"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">API Key</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Your Redmine API key"
                                    type="password"
                                    className="h-10"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Sync Settings */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <RefreshCw className="w-4 h-4 text-blue-600" />
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Sync Settings</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={redmineForm.control}
                              name="autoSync"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                                  <div className="space-y-1">
                                    <FormLabel className="text-sm font-medium">Enable Auto Sync</FormLabel>
                                    <p className="text-xs text-muted-foreground">Automatically fetch tasks</p>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={redmineForm.control}
                              name="syncInterval"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">Sync Interval (minutes)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="5"
                                      max="1440"
                                      placeholder="30"
                                      className="h-10"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">5-1440 minutes</p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={redmineForm.control}
                              name="syncStatus"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">Sync Task Status</FormLabel>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Tasks</SelectItem>
                                      <SelectItem value="new">New Tasks Only</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="closed">Closed Tasks</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={redmineForm.control}
                              name="assigneeFilter"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">Assignee Filter</FormLabel>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder="Select assignee filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="current-user">Current User Only</SelectItem>
                                      <SelectItem value="all">All Assignees</SelectItem>
                                      <SelectItem value="unassigned">Unassigned Only</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Advanced Options */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <Zap className="w-4 h-4 text-purple-600" />
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Advanced Options</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={redmineForm.control}
                              name="autoAssignTasks"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                                  <div className="space-y-1">
                                    <FormLabel className="text-sm font-medium">Auto Assign Tasks</FormLabel>
                                    <p className="text-xs text-muted-foreground">Assign to current user</p>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={redmineForm.control}
                              name="syncComments"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                                  <div className="space-y-1">
                                    <FormLabel className="text-sm font-medium">Sync Comments</FormLabel>
                                    <p className="text-xs text-muted-foreground">Include issue comments</p>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={redmineForm.control}
                            name="webhookUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Webhook URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://your-app.com/webhook/redmine"
                                    className="h-10"
                                    {...field}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Receive real-time updates</p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                    <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="submit"
                        disabled={redmineForm.formState.isSubmitting}
                        className="min-w-[140px] h-10"
                      >
                        {redmineForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Settings'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}