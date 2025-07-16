import { subMonths, format, addDays, isWeekend } from 'date-fns';
import { Task } from './types';

type TaskStatus = 'todo' | 'in-progress' | 'done';
type TaskType = 'Development' | 'Testing' | 'Design' | 'Bug Fix' | 'Documentation' | 'Meeting';

const PROJECTS = [
  'E-commerce Platform',
  'Mobile App',
  'Dashboard Redesign',
  'API Integration',
  'Performance Optimization',
  'Security Audit'
];

const TASKS: string[] = [
  'Implement user authentication',
  'Write unit tests',
  'Design landing page',
  'Fix login issue',
  'Update API documentation',
  'Optimize database queries',
  'Add dark mode',
  'Create admin dashboard',
  'Fix responsive layout',
  'Update dependencies'
];

const TEAM_MEMBERS = [
  'John Doe',
  'Jane Smith',
  'Alex Johnson',
  'Maria Garcia',
  'David Kim'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDate(start: Date, end: Date): string {
  return format(
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())),
    'yyyy-MM-dd'
  );
}

export function generateTestTasks(months: number = 6): Task[] {
  const tasks: Task[] = [];
  const now = new Date();
  const startDate = subMonths(now, months);
  
  // Generate tasks for each month
  for (let i = 0; i < months; i++) {
    const monthStart = subMonths(now, i);
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const taskCount = getRandomInt(15, 30); // 15-30 tasks per month
    
    for (let j = 0; j < taskCount; j++) {
      const day = getRandomInt(1, daysInMonth);
      const taskDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
      const taskType = getRandomElement<TaskType>(['Development', 'Testing', 'Design', 'Bug Fix', 'Documentation', 'Meeting']);
      const totalHours = getRandomInt(1, 8);
      const approvedHours = Math.max(1, Math.floor(totalHours * (0.8 + Math.random() * 0.2))); // 80-100% of total hours
      
      // Ensure some tasks are marked as done
      const status: TaskStatus = Math.random() > 0.3 ? 'done' : 
                                Math.random() > 0.5 ? 'in-progress' : 'todo';
      
      const taskId = `TASK-${1000 + tasks.length}`;
      const description = getRandomElement(TASKS);
      const completed = status === 'done';
      const note = Math.random() > 0.7 ? 'This task requires special attention' : '';
      
      const taskMonth = format(taskDate, 'yyyy-MM');
      const taskMonthName = format(taskDate, 'MMMM');
      
      tasks.push({
        taskId,
        taskType,
        description,
        totalHours,
        approvedHours: completed ? approvedHours : 0,
        project: getRandomElement(PROJECTS),
        month: taskMonthName, // Store both full name and YYYY-MM format
        monthKey: taskMonth,  // For easier filtering
        note,
        status,
        completed
      });
      
      // Log some task details for debugging
      if (tasks.length <= 5) {
        console.log('Sample task:', {
          id: taskId,
          month: taskMonthName,
          monthKey: taskMonth,
          description,
          hours: totalHours,
          status
        });
      }
    }
  }
  
  return tasks;
}

// Generate leave days (1-2 days per month)
export function generateTestLeaves(months: number = 6): string[] {
  const leaves: string[] = [];
  const now = new Date();
  
  for (let i = 0; i < months; i++) {
    const monthStart = subMonths(now, i);
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const leaveCount = getRandomInt(1, 2);
    
    for (let j = 0; j < leaveCount; j++) {
      let leaveDay: number;
      let leaveDate: Date;
      
      // Ensure we don't generate duplicate leave days
      do {
        leaveDay = getRandomInt(1, daysInMonth);
        leaveDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), leaveDay);
      } while (isWeekend(leaveDate) || leaves.includes(format(leaveDate, 'yyyy-MM-dd')));
      
      leaves.push(format(leaveDate, 'yyyy-MM-dd'));
    }
  }
  
  return leaves;
}

// Generate test data for the last 6 months
console.log('Generating test data...');
const generatedTasks = generateTestTasks(6);
const generatedLeaves = generateTestLeaves(6);

console.log(`Generated ${generatedTasks.length} tasks and ${generatedLeaves.length} leave days`);
console.log('Sample tasks:', generatedTasks.slice(0, 3));
console.log('Sample leaves:', generatedLeaves.slice(0, 3));

export const testTasks: Task[] = generatedTasks;
export const testLeaves: string[] = generatedLeaves;

// Helper function to get test data for a specific month
export function getTestDataForMonth(month: string) {
  return {
    tasks: testTasks.filter(task => task.month === month),
    leaves: testLeaves.filter(leaveDate => leaveDate.startsWith(month))
  };
}
