'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkingDaysForm } from '@/components/settings/working-days-form';
import { LeaveManagement } from '@/components/settings/leave-management';
import { ProjectsManagement } from '@/components/settings/projects-management';
import { ProjectToolsIntegration } from '@/components/settings/project-tools-integration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and workspace settings</p>
        </div>

        <Tabs defaultValue="working-days" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="working-days">Working Days</TabsTrigger>
            <TabsTrigger value="leaves">Leaves</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
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

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projects Management</CardTitle>
                <CardDescription>
                  Manage your current and past projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
              </CardHeader>
              <CardContent>
                <ProjectToolsIntegration />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
