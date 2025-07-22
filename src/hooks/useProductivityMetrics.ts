import { useMemo } from 'react';
import { Task } from '@/lib/analytics/types';
import { format } from 'date-fns';

export interface ProductivityMetrics {
  totalTasks: number;
  totalApprovedHours: number;
  totalWorkingDays: number;
  totalWorkingHours: number;
  totalLeaves: number;
  totalWorkingDaysInMonth: number;
  effectiveWorkingDays: number;
  productivity: number;
  month: string;
  year: number;
}

export function useProductivityMetrics(tasks: Task[], leaves: string[] = [], selectedMonth?: string): ProductivityMetrics {
  return useMemo(() => {
    try {
      const currentDate = new Date();
      const currentMonth = selectedMonth || format(currentDate, 'MMMM');
      const currentYear = currentDate.getFullYear();
      
      console.log('useProductivityMetrics - selected month:', currentMonth);
      
      // Use all tasks if 'all' is selected, otherwise filter by month
      const currentMonthTasks = currentMonth === 'all' ? tasks : tasks.filter(task => 
        task.month && task.month.toString().toLowerCase() === currentMonth.toLowerCase()
      );
      
      console.log('useProductivityMetrics - current month tasks:', currentMonthTasks);

      // Calculate basic metrics
      // Total Tasks - task available in the tasklist
      const totalTasks = currentMonthTasks.length;
      
      // Approved Hours - total combined approved hours on all tasks
      const totalApprovedHours = currentMonthTasks.reduce(
        (sum, task) => sum + (task.approvedHours || 0), 0
      );
      
      // Working Hours - total working hours on all tasks (using totalHours)
      const totalWorkingHours = currentMonthTasks.reduce(
        (sum, task) => sum + (task.totalHours || 0), 0
      );
      
      // Calculate total working days in current month (excluding weekends)
      const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
      const totalWorkingDaysInMonth = Array.from({ length: daysInMonth })
        .map((_, i) => new Date(currentYear, currentDate.getMonth(), i + 1))
        .filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;
      
      // Calculate leaves taken this month
      const currentMonthStart = new Date(currentYear, currentDate.getMonth(), 1);
      const currentMonthEnd = new Date(currentYear, currentDate.getMonth() + 1, 0);
      
      const totalLeaves = leaves.filter(leaveDate => {
        const leave = new Date(leaveDate);
        return leave >= currentMonthStart && leave <= currentMonthEnd;
      }).length;
      
      // Working Days - Total working days (including weekends) - calculated from hours
      // This represents the total days worked based on hours (assuming 8 hours per day)
      const totalWorkingDays = Math.ceil(totalWorkingHours / 8);
      
      // Effective Working Days - total working days in month minus leaves taken
      const effectiveWorkingDays = Math.max(0, totalWorkingDaysInMonth - totalLeaves);
      
      // Productivity - calculated based on actual work done vs effective working days available
      // Formula: (Work days from hours / Effective working days) * 100
      const workDaysFromHours = totalWorkingHours / 8;
      const productivity = effectiveWorkingDays > 0 
        ? Math.min(1, Math.max(0, workDaysFromHours / effectiveWorkingDays)) 
        : 0;

      const result = {
        totalTasks,
        totalApprovedHours,
        totalWorkingDays,
        totalWorkingHours,
        totalLeaves,
        totalWorkingDaysInMonth,
        effectiveWorkingDays,
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
        totalWorkingDaysInMonth: 0,
        effectiveWorkingDays: 0,
        productivity: 0,
        month: '',
        year: new Date().getFullYear(),
      };
    }
  }, [tasks, leaves, selectedMonth]);
}
