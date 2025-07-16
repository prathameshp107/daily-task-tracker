import { useMemo } from 'react';
import { Task } from '@/lib/analytics/types';

export interface ProductivityMetrics {
  totalTasks: number;
  totalApprovedHours: number;
  totalWorkingDays: number;
  totalWorkingHours: number;
  totalLeaves: number;
  productivity: number;
  month: string;
  year: number;
}

export function useProductivityMetrics(tasks: Task[]): ProductivityMetrics {
  return useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    // Filter tasks for current month
    const currentMonthTasks = tasks.filter(task => {
      const taskDate = new Date(task.month + ' 1, 2023'); // Simple date parsing
      return taskDate.getMonth() === currentDate.getMonth() && 
             taskDate.getFullYear() === currentYear;
    });

    // Calculate metrics
    const totalTasks = currentMonthTasks.length;
    const totalApprovedHours = currentMonthTasks.reduce(
      (sum, task) => sum + (task.approvedHours || 0), 0
    );
    
    // In a real app, these would come from your time tracking system
    const totalWorkingHours = currentMonthTasks.reduce(
      (sum, task) => sum + (task.totalHours || 0), 0
    );
    
    // In a real app, this would come from your HR/leave management system
    const totalLeaves = 2; // Example value
    
    // Calculate working days in the current month
    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
    const workingDaysInMonth = Array.from({ length: daysInMonth })
      .map((_, i) => new Date(currentYear, currentDate.getMonth(), i + 1))
      .filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;
    
    // Calculate productivity
    const finalDayWork = (totalWorkingHours / 8) - totalLeaves;
    const productivity = Math.min(1, Math.max(0, finalDayWork / workingDaysInMonth));
    
    // Calculate total working days (including weekends)
    const totalWorkingDays = Math.ceil(totalWorkingHours / 8);

    return {
      totalTasks,
      totalApprovedHours,
      totalWorkingDays,
      totalWorkingHours,
      totalLeaves,
      productivity,
      month: currentMonth,
      year: currentYear,
    };
  }, [tasks]);
}
