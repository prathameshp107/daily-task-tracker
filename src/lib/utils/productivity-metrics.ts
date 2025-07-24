import { Task } from '@/lib/analytics/types';

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

// Helper function to get months in quarter
const getMonthsInQuarter = (quarter: string): string[] => {
  switch (quarter) {
    case 'Q1': return ['April', 'May', 'June'];
    case 'Q2': return ['July', 'August', 'September'];
    case 'Q3': return ['October', 'November', 'December'];
    case 'Q4': return ['January', 'February', 'March'];
    default: return [];
  }
};

export function calculateProductivityMetrics(
  tasks: Task[], 
  leaves: string[] = [], 
  selectedPeriod?: string, 
  isQuarterView: boolean = false
): ProductivityMetrics {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Determine which period to use for calculations
    let targetPeriod: string;
    let currentPeriodTasks: Task[];
    
    if (!selectedPeriod || selectedPeriod === 'all') {
      // If no period selected or 'all' selected, use all tasks
      targetPeriod = isQuarterView ? 'All Quarters' : 'All Months';
      currentPeriodTasks = tasks;
    } else {
      // Use the selected period (month or quarter)
      targetPeriod = selectedPeriod;
      currentPeriodTasks = tasks; // Tasks are already filtered in the parent component
    }
    
    console.log('calculateProductivityMetrics - target period:', targetPeriod);
    console.log('calculateProductivityMetrics - tasks count:', currentPeriodTasks.length);
    console.log('calculateProductivityMetrics - is quarter view:', isQuarterView);

    // Calculate basic metrics
    // Total Tasks - task available in the tasklist
    const totalTasks = currentPeriodTasks.length;
    
    // Approved Hours - total combined approved hours on all tasks
    const totalApprovedHours = currentPeriodTasks.reduce(
      (sum, task) => sum + (task.approvedHours || 0), 0
    );
    
    // Working Hours - total working hours on all tasks (using totalHours)
    const totalWorkingHours = currentPeriodTasks.reduce(
      (sum, task) => sum + (task.totalHours || 0), 0
    );
    
    // Calculate total working days and leaves based on selected period (month or quarter)
    let totalWorkingDaysInMonth: number;
    let totalLeaves: number;
    
    if (!selectedPeriod || selectedPeriod === 'all') {
      // For 'all' periods, use current month for working days calculation
      const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
      totalWorkingDaysInMonth = Array.from({ length: daysInMonth })
        .map((_, i) => new Date(currentYear, currentDate.getMonth(), i + 1))
        .filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;
      
      // Calculate leaves for current month
      const currentMonthStart = new Date(currentYear, currentDate.getMonth(), 1);
      const currentMonthEnd = new Date(currentYear, currentDate.getMonth() + 1, 0);
      
      totalLeaves = leaves.filter(leaveDate => {
        const leave = new Date(leaveDate);
        return leave >= currentMonthStart && leave <= currentMonthEnd;
      }).length;
    } else if (isQuarterView) {
      // For quarter view, calculate working days for all months in the quarter
      const quarterMonths = getMonthsInQuarter(selectedPeriod);
      totalWorkingDaysInMonth = 0;
      totalLeaves = 0;
      
      quarterMonths.forEach(monthName => {
        const monthIndex = new Date(`${monthName} 1, ${currentYear}`).getMonth();
        const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
        
        // Add working days for this month
        const workingDaysInThisMonth = Array.from({ length: daysInMonth })
          .map((_, i) => new Date(currentYear, monthIndex, i + 1))
          .filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;
        
        totalWorkingDaysInMonth += workingDaysInThisMonth;
        
        // Add leaves for this month
        const monthStart = new Date(currentYear, monthIndex, 1);
        const monthEnd = new Date(currentYear, monthIndex + 1, 0);
        
        const leavesInThisMonth = leaves.filter(leaveDate => {
          const leave = new Date(leaveDate);
          return leave >= monthStart && leave <= monthEnd;
        }).length;
        
        totalLeaves += leavesInThisMonth;
      });
    } else {
      // For specific month, calculate working days for that month
      const monthIndex = new Date(`${selectedPeriod} 1, ${currentYear}`).getMonth();
      const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
      totalWorkingDaysInMonth = Array.from({ length: daysInMonth })
        .map((_, i) => new Date(currentYear, monthIndex, i + 1))
        .filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;
      
      // Calculate leaves for selected month
      const monthStart = new Date(currentYear, monthIndex, 1);
      const monthEnd = new Date(currentYear, monthIndex + 1, 0);
      
      totalLeaves = leaves.filter(leaveDate => {
        const leave = new Date(leaveDate);
        return leave >= monthStart && leave <= monthEnd;
      }).length;
    }
    
    // Working Days - Total working days (including weekends) - calculated from hours
    // This represents the total days worked based on hours (assuming 8 hours per day)
    const totalWorkingDays = Math.ceil(totalWorkingHours / 8);
    
    // Effective Working Days - total working days in month minus leaves taken
    const effectiveWorkingDays = Math.max(0, totalWorkingDaysInMonth - totalLeaves);
    
    // Productivity - calculated based on actual work done vs effective working days available
    // Formula: (Work days from hours / Effective working days) * 100
    // No longer capping at 100% to allow showing productivity > 100%
    const workDaysFromHours = totalWorkingHours / 8;
    const productivity = effectiveWorkingDays > 0 
      ? Math.max(0, workDaysFromHours / effectiveWorkingDays) 
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
      month: targetPeriod,
      year: currentYear,
    };
    
    console.log('calculateProductivityMetrics - calculated metrics:', result);
    return result;
    
  } catch (error) {
    console.error('Error in calculateProductivityMetrics:', error);
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
}