'use client';

import { useState } from 'react';
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

export function ProjectToolsIntegration() {
  const [activeTab, setActiveTab] = useState<IntegrationType>('jira');
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

  // Save integrations to localStorage
  const saveIntegrations = (config: IntegrationConfig) => {
    localStorage.setItem('projectToolIntegrations', JSON.stringify(config));
  };

  // Handle form submission
  const onJiraSubmit = (data: z.infer<typeof jiraSchema>) => {
    const updated = { ...integrations, jira: data };
    setIntegrations(updated);
    saveIntegrations(updated);
    toast({
      title: 'Jira settings saved',
      description: 'Your Jira integration has been configured successfully.',
    });
  };

  const onRedmineSubmit = (data: z.infer<typeof redmineSchema>) => {
    const updated = { ...integrations, redmine: data };
    setIntegrations(updated);
    saveIntegrations(updated);
    toast({
      title: 'Redmine settings saved',
      description: 'Your Redmine integration has been configured successfully.',
    });
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

  // Load integrations on component mount
  useState(() => {
    loadIntegrations();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Project Management Tools</h3>
        <p className="text-sm text-muted-foreground">
          Connect your project management tools to sync tasks and track time.
        </p>
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your.email@example.com" 
                              type="email"
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
                          <FormLabel>API Token</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="••••••••••••" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            <a 
                              href="https://id.atlassian.com/manage-profile/security/api-tokens" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                            >
                              Get your API token from Atlassian
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={jiraForm.control}
                      name="projectKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Key</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., TASK" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={jiraForm.control}
                      name="syncEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Sync Tasks</FormLabel>
                            <FormDescription>
                              Automatically sync Jira issues as tasks
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => testConnection('jira')}
                      disabled={jiraForm.formState.isSubmitting}
                    >
                      Test Connection
                    </Button>
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
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="••••••••••••" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            <a 
                              href="https://www.redmine.org/projects/redmine/wiki/Rest_api#Authentication" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                            >
                              Find your API key in Redmine
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={redmineForm.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Identifier</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="project-identifier" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={redmineForm.control}
                      name="syncEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Sync Tasks</FormLabel>
                            <FormDescription>
                              Automatically sync Redmine issues as tasks
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => testConnection('redmine')}
                      disabled={redmineForm.formState.isSubmitting}
                    >
                      Test Connection
                    </Button>
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
