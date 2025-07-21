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
import { Loader2 } from 'lucide-react';
import { projectService } from '@/lib/services';
import integrationService from '@/lib/services/integration.service';
import { Project } from '@/lib/types';
import { Form, FormItem, FormField, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const jiraSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  email: z.string().email('Please enter a valid email'),
  apiToken: z.string().min(1, 'API token is required'),
  projectKey: z.string().min(1, 'Project key is required'),
  syncEnabled: z.boolean(),
});

const redmineSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  apiKey: z.string().min(1, 'API key is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  syncEnabled: z.boolean(),
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

export function ProjectToolsIntegration() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [integrations, setIntegrations] = useState<ProjectIntegrations>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects and integrations from service
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load projects
        const projectsData = await projectService.getProjects();
        setProjects(projectsData);
        
        // Load integrations (this would be per project in a real implementation)
        // For now, we'll use a mock integration service
        setIntegrations({
          jira: {
            url: '',
            email: '',
            apiToken: '',
            projectKey: '',
            syncEnabled: true,
          },
          redmine: {
            url: '',
            apiKey: '',
            projectId: '',
            syncEnabled: true,
          },
        });
        
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

  const saveIntegrationForProject = async (projectName: string, type: IntegrationType, config: any) => {
    try {
      // Find the project by name
      const project = projects.find(p => p.name === projectName);
      if (!project) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Project not found.',
        });
        return;
      }

      // Save integration to service
      await integrationService.updateProjectIntegrations(project._id, {
        [type]: config
      });

      // Update local state
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
    if (!selectedProject) {
    toast({
        title: 'Select a project',
        description: 'Please select a project to save this integration.',
        variant: 'destructive',
    });
      return;
    }
    saveIntegrationForProject(selectedProject, 'jira', data);
    setSelectedProject('');
    jiraForm.reset();
  };

  const onRedmineSubmit = (data: z.infer<typeof redmineSchema>) => {
    if (!selectedProject) {
    toast({
        title: 'Select a project',
        description: 'Please select a project to save this integration.',
        variant: 'destructive',
    });
      return;
    }
    saveIntegrationForProject(selectedProject, 'redmine', data);
    setSelectedProject('');
    redmineForm.reset();
  };

  // Test connection to the service
  const testConnection = async (service: IntegrationType) => {
    try {
      const success = await integrationService.testConnection(service, integrations[service] || {});
      
        if (success) {
          toast({
            title: 'Connection successful',
            description: `Successfully connected to ${service}.`,
          });
        } else {
          toast({
            title: 'Connection failed',
            description: `Could not connect to ${service}. Please check your settings.`,
            variant: 'destructive',
          });
        }
    } catch (err) {
      console.error('Connection test failed:', err);
      toast({
        title: 'Connection failed',
        description: `Could not connect to ${service}. Please check your settings.`,
        variant: 'destructive',
      });
    }
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Project Management Tools</h3>
        <p className="text-sm text-muted-foreground">
          Connect your project management tools to sync tasks and track time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Jira Integration</CardTitle>
              <CardDescription>
                Connect your Jira account to sync issues and track time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...jiraForm}>
                <form 
                  onSubmit={jiraForm.handleSubmit(onJiraSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.length === 0 && (
                          <SelectItem value="" disabled>No projects found</SelectItem>
                        )}
                        {projects.map((proj) => (
                          <SelectItem key={proj._id} value={proj.name}>{proj.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                    <FormField
                      control={jiraForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jira URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://your-domain.atlassian.net" 
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
                          <FormLabel>Project URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://virtua-research.atlassian.net/jira/software/projects/IAC/boards/1" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>

                  <div className="flex justify-between pt-2">
                    <Button type="submit" disabled={jiraForm.formState.isSubmitting}>
                      {jiraForm.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redmine Integration</CardTitle>
              <CardDescription>
                Connect your Redmine instance to track issues and time entries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...redmineForm}>
                <form 
                  onSubmit={redmineForm.handleSubmit(onRedmineSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.length === 0 && (
                          <SelectItem value="" disabled>No projects found</SelectItem>
                        )}
                        {projects.map((proj) => (
                          <SelectItem key={proj._id} value={proj.name}>{proj.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                    <FormField
                      control={redmineForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Redmine URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://redmine.example.com" 
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
                          <FormLabel>Project URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://rm.virtuaresearch.com/projects/api-improvement" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>

                  <div className="flex justify-between pt-2">
                    <Button type="submit" disabled={redmineForm.formState.isSubmitting}>
                      {redmineForm.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
              </div>
    </div>
  );
}
