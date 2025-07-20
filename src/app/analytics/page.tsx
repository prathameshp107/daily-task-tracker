"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth";
import { Navbar } from "@/components/navbar";
import { ProductivityMetrics } from "@/components/analytics/productivity-metrics";
import { ProductivityTrends } from "@/components/analytics/productivity-trends";
import { useProductivityMetrics } from "@/hooks/useProductivityMetrics";
import { exportDashboardAndAnalyticsToExcel } from '@/lib/export/excel';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { taskService, analyticsService, leaveService } from "@/lib/services";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/lib/types";

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leaves, setLeaves] = useState<string[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tasks
        const tasksData = await taskService.getTasks({});
        setTasks(tasksData);

        // Fetch leaves
        const leavesData = await leaveService.getLeaves();
        const leaveDates = leavesData.map(leave => leave.date);
        setLeaves(leaveDates);

        // Fetch analytics trends
        const trendsData = await analyticsService.getTrends('productivity');
        setTrends(trendsData);

      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
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

  const handleExport = async () => {
    try {
      const metrics = useProductivityMetrics(tasks);
      const analyticsData = {
        metrics,
        trends,
        leaves,
      };
      await exportDashboardAndAnalyticsToExcel(tasks, analyticsData);
      toast({
        title: 'Export Successful',
        description: 'Analytics data has been exported to Excel.',
      });
    } catch (err) {
      console.error('Export failed:', err);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to export analytics data. Please try again.',
      });
    }
  };

  const AnalyticsContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    Loading analytics data...
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                  Error Loading Analytics
                </h1>
                <p className="text-red-700 dark:text-red-300 mb-4">
                  {error}
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </main>
        </div>
      );
    }

    const metrics = useProductivityMetrics(tasks);

      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          
          <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Productivity Analytics
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Track your productivity metrics and performance
                </p>
              </div>
              <Button onClick={handleExport} variant="outline">
                Export to Excel
              </Button>
              </div>
              
              <ProductivityMetrics 
                totalTasks={metrics.totalTasks}
                totalApprovedHours={metrics.totalApprovedHours}
                totalWorkingDays={metrics.totalWorkingDays}
                totalWorkingHours={metrics.totalWorkingHours}
                totalLeaves={metrics.totalLeaves}
                productivity={metrics.productivity}
                month={metrics.month}
                year={metrics.year}
              />
              
            <ProductivityTrends data={trends} />
            </div>
          </main>
        </div>
      );
  };

  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}