"use client";

import { ProtectedRoute } from "@/components/auth";
import { Navbar } from "@/components/navbar";
import { ProductivityMetrics } from "@/components/analytics/productivity-metrics";
import { ProductivityTrends } from "@/components/analytics/productivity-trends";
import { useProductivityMetrics } from "@/hooks/useProductivityMetrics";
import { format } from "date-fns";
import { exportDashboardAndAnalyticsToExcel } from '@/lib/export/excel';
import { testTasks, testLeaves } from "@/lib/analytics/test-data";
import { Button } from "@/components/ui/button";

// Format test data to match the expected format
const formatTestData = () => {
  try {
    const currentMonth = format(new Date(), 'MMMM');
    console.log('Current month:', currentMonth);
    
    // Get current month's tasks (case-insensitive comparison)
    const currentMonthTasks = testTasks.filter(task => 
      task.month.toLowerCase() === currentMonth.toLowerCase()
    );
    
    console.log('Total test tasks:', testTasks.length);
    console.log('Current month tasks:', currentMonthTasks.length);
    console.log('Test leaves:', testLeaves.length);

    // Generate trend data for the last 6 months
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = format(date, 'MMMM');
      
      // Filter tasks for this month (case-insensitive comparison)
      const monthTasks = testTasks.filter(task => 
        task.month.toLowerCase() === monthName.toLowerCase()
      );
      
      // Filter leaves for this month
      const monthLeaves = testLeaves.filter(leave => {
        try {
          const leaveDate = new Date(leave);
          return format(leaveDate, 'MMMM').toLowerCase() === monthName.toLowerCase();
        } catch (error) {
          console.error('Error parsing leave date:', leave, error);
          return false;
        }
      });
      
      const totalHours = monthTasks.reduce((sum, task) => sum + (task.totalHours || 0), 0);
      const approvedHours = monthTasks.reduce((sum, task) => sum + (task.approvedHours || 0), 0);
      const workingDays = 20 + (i % 3); // Vary working days slightly
      
      // Calculate productivity (0-1 scale)
      const workDays = Math.min(totalHours / 8, workingDays);
      const productivity = workingDays > 0 ? Math.min(1, (workDays - monthLeaves.length) / workingDays) : 0;
      
      months.push({
        month: monthName,
        productivity: Math.max(0, productivity),
        workingDays,
        workDays: Math.min(Math.floor(totalHours / 8), workingDays - monthLeaves.length),
        workingHours: totalHours,
        leaves: monthLeaves.length
      });
      
      console.log(`Month ${monthName}:`, {
        tasks: monthTasks.length,
        leaves: monthLeaves.length,
        totalHours,
        workDays: Math.min(Math.floor(totalHours / 8), workingDays - monthLeaves.length),
        productivity: Math.max(0, productivity)
      });
    }
    
    return { 
      tasks: currentMonthTasks, 
      trends: months 
    };
  } catch (error) {
    console.error('Error in formatTestData:', error);
    return { tasks: [], trends: [] };
  }
};

// Get test data
const { tasks: mockTasks, trends: mockTrends } = formatTestData();

export default function AnalyticsPage() {
  const handleExport = async () => {
    // Prepare analytics data for export
    const metrics = useProductivityMetrics(mockTasks);
    const analyticsData = {
      metrics,
      trends: mockTrends,
      leaves: testLeaves,
    };
    await exportDashboardAndAnalyticsToExcel(testTasks, analyticsData);
  };

  const AnalyticsContent = () => {
    try {
      console.log('Rendering AnalyticsPage with mock data:', {
        taskCount: mockTasks.length,
        trendCount: mockTrends.length
      });
      
      const metrics = useProductivityMetrics(mockTasks);
      console.log('Calculated metrics:', metrics);

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
              
              <ProductivityTrends data={mockTrends} />
            </div>
          </main>
        </div>
      );
    } catch (error) {
      console.error('Error in AnalyticsPage:', error);
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                Error Loading Analytics
              </h1>
              <p className="text-gray-700 dark:text-gray-300">
                There was an error loading the analytics data. Please check the console for more details.
              </p>
              <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-xs overflow-x-auto">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </pre>
            </div>
          </main>
        </div>
      );
    }
  }

  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  )
}