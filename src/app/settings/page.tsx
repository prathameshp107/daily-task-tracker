'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkingDaysForm } from '@/components/settings/working-days-form';
import { LeaveManagement } from '@/components/settings/leave-management';
import { ProjectToolsIntegration } from '@/components/settings/project-tools-integration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/navbar';
import { projectService } from '@/lib/services';

export default function SettingsPage() {
  const [isAutomated, setIsAutomated] = useState(false);
  const [loadingMode, setLoadingMode] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  // Load projects on mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const projects = await projectService.getProjects();
        setProjects(projects);
        setLoadingMode(false);
      } catch (e) {
        setProjects([]);
        setLoadingMode(false);
      }
    }
    fetchProjects();
  }, []);

  // When a project is selected, update isAutomated based on its integrationMode
  useEffect(() => {
    if (!selectedProjectId || projects.length === 0) return;
    const project = projects.find(p => p._id === selectedProjectId);
    let mode = 'manual';
    if (project?.integrations?.jira?.integrationMode) {
      mode = project.integrations.jira.integrationMode;
    } else if (project?.integrations?.redmine?.integrationMode) {
      mode = project.integrations.redmine.integrationMode;
    }
    setIsAutomated(mode === 'automated');
  }, [selectedProjectId, projects]);

  // Handle mode change from integration component
  const handleModeChange = (mode: 'manual' | 'automated') => {
    setIsAutomated(mode === 'automated');
    // The integration component will handle saving this mode with the integration config
  };

  if (loadingMode) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-gray-600 dark:text-gray-400">Loading settings...</span>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto py-8 flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and workspace settings</p>
          </div>

          <Tabs defaultValue="working-days" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="working-days">Working Days</TabsTrigger>
              <TabsTrigger value="leaves">Leaves</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="working-days" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Working Days Configuration</CardTitle>
                  <CardDescription>
                    Set your standard working days and hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkingDaysForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaves" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Management</CardTitle>
                  <CardDescription>
                    Manage your leaves and time off
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeaveManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Project Selection</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a project to configure its integration settings.
                    </p>
                  </div>
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-select">Project</Label>
                      <select
                        id="project-select"
                        className="w-full h-10 border rounded px-2"
                        value={selectedProjectId || ''}
                        onChange={e => setSelectedProjectId(e.target.value)}
                      >
                        <option value="" disabled>Select a project</option>
                        {projects.map(project => (
                          <option key={project._id} value={project._id}>{project.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 flex items-center">
                      <Label htmlFor="mode-toggle" className="text-sm font-medium mr-2">
                        Manual way
                      </Label>
                      <Switch
                        id="mode-toggle"
                        checked={isAutomated}
                        onCheckedChange={checked => handleModeChange(checked ? 'automated' : 'manual')}
                        className="data-[state=checked]:bg-blue-600"
                        disabled={!selectedProjectId}
                      />
                      <Label htmlFor="mode-toggle" className="text-sm font-medium ml-2">
                        Automated way
                      </Label>
                      <div className="ml-4 text-xs text-muted-foreground">
                        {isAutomated ? 'Using automated configuration' : 'Using manual configuration'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedProjectId && (
                    <ProjectToolsIntegration
                      isAutomated={isAutomated}
                      onModeChange={handleModeChange}
                      selectedProjectId={selectedProjectId}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}
