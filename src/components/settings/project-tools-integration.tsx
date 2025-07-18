'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Define the integration types
const INTEGRATION_TYPES = [
  { id: 'jira', name: 'Jira', icon: 'jira.png' },
  { id: 'redmine', name: 'Redmine', icon: 'redmine.png' },
  { id: 'asana', name: 'Asana', icon: 'asana.png' },
  { id: 'trello', name: 'Trello', icon: 'trello.png' },
];

// Schema for Jira integration
const jiraSchema = z.object({
  url: z.string().url('Please enter a valid URL').min(1, 'Required'),
  email: z.string().email('Please enter a valid email').min(1, 'Required'),
  apiToken: z.string().min(1, 'Required'),
  projectKey: z.string().min(1, 'Required'),
  syncEnabled: z.boolean().default(true),
});

// Schema for Redmine integration
const redmineSchema = z.object({
  url: z.string().url('Please enter a valid URL').min(1, 'Required'),
  apiKey: z.string().min(1, 'Required'),
  projectId: z.string().min(1, 'Required'),
  syncEnabled: z.boolean().default(true),
});

type IntegrationType = 'jira' | 'redmine' | 'asana' | 'trello';
type IntegrationConfig = {
  jira: z.infer<typeof jiraSchema> | null;
  redmine: z.infer<typeof redmineSchema> | null;
  asana: any | null;
  trello: any | null;
};

// Reusing the same Project type as in projects-management.tsx
interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  client?: string;
  color: string;
  integrations?: {
    jira?: {
      url: string;
      email: string;
      apiToken: string;
      projectKey: string;
      syncEnabled: boolean;
    };
    redmine?: {
      url: string;
      apiKey: string;
      projectId: string;
      syncEnabled: boolean;
    };
  };
}

export function ProjectToolsIntegration() {
  const [activeTab, setActiveTab] = useState<IntegrationType>('jira');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [integrations, setIntegrations] = useState<IntegrationConfig>({
    jira: null,
    redmine: null,
    asana: null,
    trello: null,
  });

  // Load saved integrations from localStorage
  const loadIntegrations = () => {
    const savedIntegrations = localStorage.getItem('projectToolIntegrations');
    if (savedIntegrations) {
      try {
        setIntegrations(JSON.parse(savedIntegrations));
      } catch (e) {
        console.error('Failed to parse saved integrations', e);
      }
    }
  };

  // Save integration settings to the project in localStorage
  const saveIntegrations = (config: IntegrationConfig) => {
    if (!selectedProjectId) return;
    
    setProjects(currentProjects => {
      const updatedProjects = currentProjects.map(project => {
        if (project.id === selectedProjectId) {
          const updatedIntegrations = {
            ...project.integrations,
            jira: config.jira ? { 
              url: config.jira.url,
              email: config.jira.email,
              apiToken: config.jira.apiToken,
              projectKey: config.jira.projectKey,
              syncEnabled: config.jira.syncEnabled
            } : project.integrations?.jira,
            redmine: config.redmine ? {
              url: config.redmine.url,
              apiKey: config.redmine.apiKey,
              projectId: config.redmine.projectId,
              syncEnabled: config.redmine.syncEnabled
            } : project.integrations?.redmine
          };
          
          // Only include integrations if at least one exists
          const hasIntegrations = updatedIntegrations.jira || updatedIntegrations.redmine;
          
          return {
            ...project,
            integrations: hasIntegrations ? updatedIntegrations : undefined
          };
        }
        return project;
      });
      
      // Save updated projects back to localStorage
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      return updatedProjects;
    });
  };

  // Handle form submission
  const onJiraSubmit = (data: z.infer<typeof jiraSchema>) => {
    const updated = { 
      ...integrations, 
      jira: {
        ...data,
        // Ensure we're only saving the fields we need
        url: data.url.trim(),
        email: data.email.trim(),
        apiToken: data.apiToken,
        projectKey: data.projectKey.trim(),
        syncEnabled: data.syncEnabled
      }
    };
    setIntegrations(updated);
    saveIntegrations(updated);
    toast('Jira settings saved - Your Jira integration has been configured successfully.');
  };

  const onRedmineSubmit = (data: z.infer<typeof redmineSchema>) => {
    const updated = { 
      ...integrations, 
      redmine: {
        ...data,
        // Ensure we're only saving the fields we need
        url: data.url.trim(),
        apiKey: data.apiKey,
        projectId: data.projectId.trim(),
        syncEnabled: data.syncEnabled
      }
    };
    setIntegrations(updated);
    saveIntegrations(updated);
    toast('Redmine settings saved - Your Redmine integration has been configured successfully.');
  };

  // Test connection to the service
  const testConnection = (service: IntegrationType) => {
    // In a real app, this would make an API call to test the connection
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // Simulate a successful connection 90% of the time
        const success = Math.random() > 0.1;
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
        resolve(success);
      }, 1500);
    });
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

  // Load projects from localStorage on component mount
  useEffect(() => {
    const fetchProjects = () => {
      setIsLoading(true);
      try {
        // Load projects from localStorage (same as ProjectsManagement component)
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) {
          const projectsData: Project[] = JSON.parse(savedProjects);
          setProjects(projectsData);
          if (projectsData.length > 0) {
            setSelectedProjectId(projectsData[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
    loadIntegrations();
  }, []);

  // Update form values when selected project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return;

    // Update Jira form if project has Jira integration
    if (project.integrations?.jira) {
      const jiraData = project.integrations.jira;
      jiraForm.reset({
        url: jiraData.url,
        email: jiraData.email,
        apiToken: jiraData.apiToken, // Note: In a real app, consider security implications
        projectKey: jiraData.projectKey,
        syncEnabled: jiraData.syncEnabled
      });
    } else if (integrations.jira) {
      // Reset Jira form if no integration for this project
      jiraForm.reset({
        url: '',
        email: '',
        apiToken: '',
        projectKey: '',
        syncEnabled: true
      });
    }

    // Update Redmine form if project has Redmine integration
    if (project.integrations?.redmine) {
      const redmineData = project.integrations.redmine;
      redmineForm.reset({
        url: redmineData.url,
        apiKey: redmineData.apiKey, // Note: In a real app, consider security implications
        projectId: redmineData.projectId,
        syncEnabled: redmineData.syncEnabled
      });
    } else if (integrations.redmine) {
      // Reset Redmine form if no integration for this project
      redmineForm.reset({
        url: '',
        apiKey: '',
        projectId: '',
        syncEnabled: true
      });
    }
  }, [selectedProjectId, projects]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Project Management Tools</h3>
        <p className="text-sm text-muted-foreground">
          Connect your project management tools to sync tasks and track time.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-select">Select Project</Label>
        <Select 
          value={selectedProjectId} 
          onValueChange={setSelectedProjectId}
          disabled={isLoading || projects.length === 0}
        >
          <SelectTrigger className="w-full md:w-1/2">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        )}
        {!isLoading && projects.length === 0 && (
          <p className="text-sm text-muted-foreground">No projects found</p>
        )}
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as IntegrationType)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          {INTEGRATION_TYPES.map((tool) => (
            <TabsTrigger 
              key={tool.id} 
              value={tool.id}
              className="flex items-center gap-2"
            >
              <span className="capitalize">{tool.name}</span>
              {integrations[tool.id as keyof IntegrationConfig] && (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="jira" className="mt-6">
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
        </TabsContent>

        <TabsContent value="redmine" className="mt-6">
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
        </TabsContent>

        <TabsContent value="asana" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Asana Integration</CardTitle>
              <CardDescription>
                Coming soon! Connect your Asana account to sync tasks and track time.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Integration in development</h3>
              <p className="mt-2 text-sm text-gray-500">
                We're working on bringing Asana integration to you soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trello" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trello Integration</CardTitle>
              <CardDescription>
                Coming soon! Connect your Trello boards to track tasks and time.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Integration in development</h3>
              <p className="mt-2 text-sm text-gray-500">
                We're working on bringing Trello integration to you soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
