import { useMemo } from 'react';
import { Task } from '@/lib/analytics/types';
import { format } from 'date-fns';

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
    try {
      const currentDate = new Date();
      const currentMonth = format(currentDate, 'MMMM');
      const currentYear = currentDate.getFullYear();
      
      console.log('useProductivityMetrics - current month:', currentMonth);
      
      // Filter tasks for current month (case-insensitive comparison)
      const currentMonthTasks = tasks.filter(task => 
        task.month && task.month.toString().toLowerCase() === currentMonth.toLowerCase()
      );
      
      console.log('useProductivityMetrics - current month tasks:', currentMonthTasks);

      // Calculate metrics
      const totalTasks = currentMonthTasks.length;
      const totalApprovedHours = currentMonthTasks.reduce(
        (sum, task) => sum + (task.approvedHours || 0), 0
      );
      
      const totalWorkingHours = currentMonthTasks.reduce(
        (sum, task) => sum + (task.totalHours || 0), 0
      );
      
      // Get total leaves - in a real app, this would come from your HR/leave management system
      // For now, we'll use a fixed value since we don't have access to the leaves data here
      const totalLeaves = 2; // This should be passed as a prop or from context
      
      // Calculate working days in the current month
      const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
      const workingDaysInMonth = Array.from({ length: daysInMonth })
        .map((_, i) => new Date(currentYear, currentDate.getMonth(), i + 1))
        .filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;
      
      // Calculate productivity
      const workDays = totalWorkingHours / 8;
      const finalDayWork = workDays - totalLeaves;
      const productivity = workingDaysInMonth > 0 
        ? Math.min(1, Math.max(0, finalDayWork / workingDaysInMonth)) 
        : 0;
      
      // Calculate total working days (including weekends)
      const totalWorkingDays = Math.ceil(totalWorkingHours / 8);

      const result = {
        totalTasks,
        totalApprovedHours,
        totalWorkingDays,
        totalWorkingHours,
        totalLeaves,
        productivity,
        month: currentMonth,
        year: currentYear,
      };
      
      console.log('useProductivityMetrics - calculated metrics:', result);
      return result;
      
    } catch (error) {
      console.error('Error in useProductivityMetrics:', error);
      return {
        totalTasks: 0,
        totalApprovedHours: 0,
        totalWorkingDays: 0,
        totalWorkingHours: 0,
        totalLeaves: 0,
        productivity: 0,
        month: '',
        year: new Date().getFullYear(),
      };
    }
  }, [tasks]);
}
