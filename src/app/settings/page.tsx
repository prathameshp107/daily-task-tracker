'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkingDaysForm } from '@/components/settings/working-days-form';
import { LeaveManagement } from '@/components/settings/leave-management';
import { ProjectToolsIntegration } from '@/components/settings/project-tools-integration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/navbar';

export default function SettingsPage() {
  const [isAutomated, setIsAutomated] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto py-8 flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and workspace settings</p>
            
            <div className="flex items-center space-x-3 mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
              <Label htmlFor="mode-toggle" className="text-sm font-medium">
                Manual way
              </Label>
              <Switch
                id="mode-toggle"
                checked={isAutomated}
                onCheckedChange={setIsAutomated}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="mode-toggle" className="text-sm font-medium">
                Automated way
              </Label>
              <div className="ml-4 text-xs text-muted-foreground">
                {isAutomated ? 'Using automated configuration' : 'Using manual configuration'}
              </div>
            </div>
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
                </CardHeader>
                <CardContent>
                  <ProjectToolsIntegration isAutomated={isAutomated} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}
