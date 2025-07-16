"use client";

import { Navbar } from "@/components/navbar";
import { ProductivityMetrics } from "@/components/analytics/productivity-metrics";
import { ProductivityTrends } from "@/components/analytics/productivity-trends";
import { useProductivityMetrics } from "@/hooks/useProductivityMetrics";
import { getLastNMonths } from "@/lib/analytics/date-utils";

// Generate mock data for the last 6 months
const generateMockTasks = (): Array<{
  taskId: string;
  taskType: string;
  description: string;
  totalHours: number;
  approvedHours: number;
  project: string;
  month: string;
  note: string;
  status: 'todo' | 'in-progress' | 'done';
  completed: boolean;
}> => {
  const months = getLastNMonths(6);
  const taskTypes = ["Development", "Bug Fix", "Design", "Testing", "Documentation"];
  const projects = ["Project Alpha", "Project Beta", "Project Gamma"];
  
  const tasks = [];
  let taskId = 1;
  
  for (const { month, monthName, year } of months) {
    const tasksThisMonth = 3 + Math.floor(Math.random() * 5); // 3-7 tasks per month
    
    for (let i = 0; i < tasksThisMonth; i++) {
      const totalHours = 2 + Math.floor(Math.random() * 30); // 2-32 hours per task
      const completed = Math.random() > 0.3; // 70% chance of being completed
      const status: 'todo' | 'in-progress' | 'done' = completed ? 'done' : 
                    Math.random() > 0.5 ? 'in-progress' : 'todo';
      
      tasks.push({
        taskId: `TASK-${String(taskId).padStart(3, '0')}`,
        taskType: taskTypes[Math.floor(Math.random() * taskTypes.length)],
        description: `Task description ${taskId}`,
        totalHours: completed ? totalHours : Math.floor(totalHours * (0.3 + Math.random() * 0.7)),
        approvedHours: completed ? totalHours * (0.8 + Math.random() * 0.4) : 0,
        project: projects[Math.floor(Math.random() * projects.length)],
        month: monthName,
        note: "",
        status,
        completed
      });
      
      taskId++;
    }
  }
  
  return tasks;
};

// Mock productivity trend data
const generateMockTrends = () => {
  const months = getLastNMonths(6);
  return months.map(({ monthName, month, year }) => {
    const workingDays = 20 + Math.floor(Math.random() * 5); // 20-24 working days
    const workDays = 10 + Math.floor(Math.random() * (workingDays - 5)); // 10 to workingDays-5 work days
    const productivity = workDays / workingDays;
    
    return {
      month: `${monthName} '${String(year).slice(-2)}`,
      productivity: Math.min(1, productivity * (0.8 + Math.random() * 0.4)), // Add some variance
      workingDays,
      workDays: workDays * (0.8 + Math.random() * 0.4) // Add some variance
    };
  });
};

const mockTasks = generateMockTasks();
const mockTrends = generateMockTrends();

export default function AnalyticsPage() {
  const metrics = useProductivityMetrics(mockTasks);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Productivity Analytics
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your productivity metrics and performance
            </p>
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
}