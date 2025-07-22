"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth";
import { Navbar } from "@/components/navbar";
import { ProductivityMetrics } from "@/components/analytics/productivity-metrics";
import { ProductivityTrends } from "@/components/analytics/productivity-trends";
import { useProductivityMetrics } from "@/hooks/useProductivityMetrics";
import { exportDashboardAndAnalyticsToExcel } from '@/lib/export/excel';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar } from "lucide-react";
import { taskService, analyticsService, leaveService } from "@/lib/services";
import { useToast } from "@/components/ui/use-toast";
import { Task as MainTask } from "@/lib/types";
import { Task as AnalyticsTask } from "@/lib/analytics/types";

// Convert main Task type to analytics Task type
const convertToAnalyticsTask = (task: MainTask): AnalyticsTask => {
  return {
    taskId: task._id || task.id || '',
    taskType: task.type || '',
    description: task.description || task.title || '',
    totalHours: task.estimatedHours || task.totalHours || 0,
    approvedHours: task.actualHours || task.approvedHours || 0,
    project: task.project || '',
    month: task.month || new Date().toLocaleString('default', { month: 'long' }),
    note: task.note || '',
    status: (task.status === 'pending' ? 'todo' : task.status === 'completed' ? 'done' : task.status) as 'todo' | 'in-progress' | 'done',
    completed: task.completed || false,
  };
};

// Generate productivity trends data from tasks
const generateProductivityTrends = (tasks: AnalyticsTask[], leaves: string[]) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate data for the last 6 months
  const trendsData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(currentYear, currentDate.getMonth() - i, 1);
    const monthName = months[monthDate.getMonth()];
    const monthYear = monthDate.getFullYear();
    
    // Filter tasks for this month
    const monthTasks = tasks.filter(task => 
      task.month && task.month.toLowerCase() === monthName.toLowerCase()
    );

    // Calculate working days in this month (excluding weekends)
    const daysInMonth = new Date(monthYear, monthDate.getMonth() + 1, 0).getDate();
    const workingDaysInMonth = Array.from({ length: daysInMonth })
      .map((_, j) => new Date(monthYear, monthDate.getMonth(), j + 1))
      .filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;

    // Calculate leaves for this month
    const monthStart = new Date(monthYear, monthDate.getMonth(), 1);
    const monthEnd = new Date(monthYear, monthDate.getMonth() + 1, 0);
    
    const monthLeaves = leaves.filter(leaveDate => {
      const leave = new Date(leaveDate);
      return leave >= monthStart && leave <= monthEnd;
    }).length;

    // Calculate metrics
    const totalHours = monthTasks.reduce((sum, task) => sum + (task.totalHours || 0), 0);
    const workDays = totalHours / 8;
    const effectiveWorkingDays = Math.max(0, workingDaysInMonth - monthLeaves);
    const productivity = effectiveWorkingDays > 0 
      ? Math.min(1, Math.max(0, workDays / effectiveWorkingDays)) 
      : 0;

    trendsData.push({
      month: monthName.substring(0, 3), // Short month name (Jan, Feb, etc.)
      productivity: productivity,
      workingDays: effectiveWorkingDays,
      workDays: workDays,
      totalTasks: monthTasks.length,
      totalHours: totalHours,
      leaves: monthLeaves
    });
  }

  return trendsData;
};

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<AnalyticsTask[]>([]);
  const [allTasks, setAllTasks] = useState<AnalyticsTask[]>([]); // Store all tasks
  const [leaves, setLeaves] = useState<string[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('current'); // 'current' or specific month

  // Available months for dropdown
  const availableMonths = [
    { value: 'current', label: 'Current Month' },
    { value: 'all', label: 'All Months' },
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' },
  ];
    
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
      
        // Fetch tasks and convert to analytics format
        const tasksData = await taskService.getTasks({});
        const analyticsTasksData = tasksData.map(convertToAnalyticsTask);
        setAllTasks(analyticsTasksData); // Store all tasks
        setTasks(analyticsTasksData); // Initially show all tasks
      
        // Fetch leaves
        const leavesData = await leaveService.getLeaves();
        const leaveDates = leavesData.map(leave => leave.date);
        setLeaves(leaveDates);

        // Generate productivity trends from tasks data
        const trendsData = generateProductivityTrends(analyticsTasksData, leaveDates);
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

  // Filter tasks based on selected month
  useEffect(() => {
    if (selectedMonth === 'all') {
      setTasks(allTasks);
    } else if (selectedMonth === 'current') {
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      const filteredTasks = allTasks.filter(task => 
        task.month && task.month.toLowerCase() === currentMonth.toLowerCase()
      );
      setTasks(filteredTasks);
    } else {
      // Filter by specific month
      const filteredTasks = allTasks.filter(task => 
        task.month && task.month.toLowerCase() === selectedMonth.toLowerCase()
      );
      setTasks(filteredTasks);
    }

    // Regenerate trends based on filtered data
    const trendsData = generateProductivityTrends(allTasks, leaves);
    setTrends(trendsData);
  }, [selectedMonth, allTasks, leaves]);

  // Handle month selection change
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleExport = async () => {
    try {
      const metrics = useProductivityMetrics(tasks, leaves);
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

    const metrics = useProductivityMetrics(tasks, leaves, selectedMonth);

      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          
          <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Productivity Analytics
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Track your productivity metrics and performance
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Month Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <Select value={selectedMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMonths.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleExport} variant="outline">
                  Export to Excel
                </Button>
              </div>
            </div>
              
              <ProductivityMetrics 
                totalTasks={metrics.totalTasks}
                totalApprovedHours={metrics.totalApprovedHours}
                totalWorkingDays={metrics.totalWorkingDays}
                totalWorkingHours={metrics.totalWorkingHours}
                totalLeaves={metrics.totalLeaves}
                totalWorkingDaysInMonth={metrics.totalWorkingDaysInMonth}
                effectiveWorkingDays={metrics.effectiveWorkingDays}
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