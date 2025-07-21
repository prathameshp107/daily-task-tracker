'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { projectService } from '@/lib/services';
import { Project } from '@/lib/types';

const projectStatuses = [
  { id: 'active', label: 'Active', color: 'bg-green-500' },
  { id: 'on_hold', label: 'On Hold', color: 'bg-yellow-500' },
  { id: 'completed', label: 'Completed', color: 'bg-blue-500' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

const projectSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  status: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().optional(),
  client: z.string().optional(),
  color: z.string().min(1, 'Required'),
  jiraUrl: z.string().optional(),
  jiraProjectKey: z.string().optional(),
  redmineUrl: z.string().optional(),
  redmineProjectId: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectsManagementProps {
  selectedMonth?: string;
}

export function ProjectsManagement({ selectedMonth = 'all' }: ProjectsManagementProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      client: '',
      color: '#3b82f6', // Default blue color
      jiraUrl: '',
      jiraProjectKey: '',
      redmineUrl: '',
      redmineProjectId: '',
    },
  });

  // Load projects from service
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const projectsData = await projectService.getProjects();
        setProjects(projectsData);
      } catch (err) {
        console.error('Failed to load projects:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
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

    loadProjects();
  }, []);

  // Filter projects based on selected month
  useEffect(() => {
    if (selectedMonth === 'all') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project => {
        const startDate = new Date(project.startDate);
        const projectMonth = startDate.toLocaleString('default', { month: 'long' }).toLowerCase();
        return projectMonth === selectedMonth;
      });
      setFilteredProjects(filtered);
    }
  }, [projects, selectedMonth]);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      if (isEditing && currentProject) {
        // Update existing project
        const updatedProject = await projectService.updateProject(currentProject._id, {
          name: data.name,
          description: data.description || '',
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate || undefined,
          client: data.client || '',
          color: data.color,
        });
        
      setProjects(projects.map(project => 
          project._id === currentProject._id ? updatedProject : project
      ));
        
        toast({
          title: 'Success',
          description: 'Project updated successfully.',
        });
    } else {
      // Add new project
        const newProject = await projectService.createProject({
          name: data.name,
          description: data.description || '',
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate || undefined,
          client: data.client || '',
          color: data.color,
        });
        
      setProjects([...projects, newProject]);
        toast({
          title: 'Success',
          description: 'Project created successfully.',
        });
    }
    
    // Reset form and close it
    form.reset();
    setIsFormOpen(false);
    setIsEditing(false);
      setCurrentProject(null);
    } catch (err) {
      console.error('Failed to save project:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save project. Please try again.',
      });
    }
  };

  const editProject = (project: Project) => {
    form.reset({
      name: project.name,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate || '',
      client: project.client || '',
      color: project.color,
      jiraUrl: '',
      jiraProjectKey: '',
      redmineUrl: '',
      redmineProjectId: '',
    });
    setCurrentProject(project);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const deleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(id);
        setProjects(projects.filter(project => project._id !== id));
        toast({
          title: 'Success',
          description: 'Project deleted successfully.',
        });
      } catch (err) {
        console.error('Failed to delete project:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete project. Please try again.',
        });
      }
    }
  };

  const getStatusBadge = (statusId: string) => {
    const status = projectStatuses.find(s => s.id === statusId);
    return (
      <Badge 
        className={`${status?.color || 'bg-gray-500'} text-white`}
        variant="outline"
      >
        {status?.label || statusId}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">
            Loading projects...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Projects
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Projects</h3>
        <Button 
          onClick={() => {
            setIsFormOpen(true);
            setIsEditing(false);
            form.reset({
              name: '',
              description: '',
              status: 'active',
              startDate: new Date().toISOString().split('T')[0],
              client: '',
              color: '#3b82f6',
            });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {isFormOpen && (
        <div className="p-6 border rounded-lg bg-card">
          <h4 className="text-lg font-medium mb-4">
            {isEditing ? 'Edit Project' : 'Add New Project'}
          </h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Input placeholder="Client name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projectStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="color" 
                          className="w-16 h-10 p-1" 
                          {...field} 
                        />
                        <Input 
                          value={field.value} 
                          onChange={field.onChange}
                          className="w-24"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Project description, goals, or any important notes..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-4 border-t mt-4">
                <h4 className="text-sm font-medium">Integration Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M15.7 2.7c.4.4.7 1 .7 1.6v9.4c0 .6-.2 1.2-.7 1.6-.4.4-1 .7-1.6.7H1.9c-.6 0-1.2-.2-1.6-.7C-.1 15-.1 13.7.7 13l3.9-3.9c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L2.1 14.4c-.1.1-.1.1 0 .2.1 0 .1 0 .2 0h12.2c.1 0 .1 0 .2-.1 0 0 0-.1.1-.2V4.3c0-.1 0-.1-.1-.2 0 0 0-.1-.1-.1H4.3c-.6 0-1-.4-1-1s.4-1 1-1h9.8c.6 0 1.2.3 1.6.7z"/>
                      </svg>
                      <h5 className="font-medium">Jira Integration</h5>
                    </div>
                    <FormField
                      control={form.control}
                      name="jiraUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jira URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://your-domain.atlassian.net" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jiraProjectKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Key</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., PROJ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.5C6.201 22.5 1.5 17.799 1.5 12S6.201 1.5 12 1.5 22.5 6.201 22.5 12 17.799 22.5 12 22.5z"/>
                        <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10.5c-2.485 0-4.5-2.015-4.5-4.5S9.515 7.5 12 7.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z"/>
                      </svg>
                      <h5 className="font-medium">Redmine Integration</h5>
                    </div>
                    <FormField
                      control={form.control}
                      name="redmineUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Redmine URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://redmine.yourdomain.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="redmineProjectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project ID</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update Project' : 'Create Project'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {filteredProjects.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Integration Links</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                  </TableCell>
                  <TableCell>{project.client || '-'}</TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {/* The integrationType logic was removed, so this block will always show Jira and Redmine if they exist */}
                      {project.integrations?.jira?.url && (
                        <a 
                          href={project.integrations.jira.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                          title={project.integrations.jira.projectKey ? `Project Key: ${project.integrations.jira.projectKey}` : 'Jira Project'}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M15.7 2.7c.4.4.7 1 .7 1.6v9.4c0 .6-.2 1.2-.7 1.6-.4.4-1 .7-1.6.7H1.9c-.6 0-1.2-.2-1.6-.7C-.1 15-.1 13.7.7 13l3.9-3.9c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L2.1 14.4c-.1.1-.1.1 0 .2.1 0 .1 0 .2 0h12.2c.1 0 .1 0 .2-.1 0 0 0-.1.1-.2V4.3c0-.1 0-.1-.1-.2 0 0 0-.1-.1-.1H4.3c-.6 0-1-.4-1-1s.4-1 1-1h9.8c.6 0 1.2.3 1.6.7z"/>
                          </svg>
                          Jira
                        </a>
                      )}
                      {project.integrations?.redmine?.url && (
                        <a 
                          href={project.integrations.redmine.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-red-600 hover:underline text-sm flex items-center gap-1"
                          title={project.integrations.redmine.projectId ? `Project ID: ${project.integrations.redmine.projectId}` : 'Redmine Project'}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.5C6.201 22.5 1.5 17.799 1.5 12S6.201 1.5 12 1.5 22.5 6.201 22.5 12 17.799 22.5 12 22.5z"/>
                            <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10.5c-2.485 0-4.5-2.015-4.5-4.5S9.515 7.5 12 7.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z"/>
                          </svg>
                          Redmine
                        </a>
                      )}
                      {(!project.integrations?.jira?.url && !project.integrations?.redmine?.url) && (
                        <span className="text-muted-foreground text-xs">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => editProject(project)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deleteProject(project._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto h-12 w-12"
            >
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {selectedMonth === 'all' ? 'No projects' : `No projects in ${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)}`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedMonth === 'all' 
              ? 'Get started by creating a new project.'
              : 'Try selecting a different month or create a new project.'
            }
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
