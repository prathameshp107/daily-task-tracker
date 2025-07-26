'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, Calendar, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { taskService, leaveService, projectService } from '@/lib/services';
import { exportTasksAndAnalyticsToExcel } from '@/lib/export/excel';
import { Task as MainTask } from '@/lib/types';
import { Task as AnalyticsTask } from '@/lib/analytics/types';
import { calculateProductivityMetrics } from '@/lib/utils/productivity-metrics';

interface ExportDialogProps {
  allTasks: MainTask[];
  allLeaves: string[];
}

// Convert main Task type to analytics Task type
const convertToAnalyticsTask = (task: MainTask): AnalyticsTask => {
  return {
    taskId: task._id || task.id || '',
    taskNumber: (task as any).taskNumber || '',
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

// Helper function to get month from task
const getMonthFromTask = (task: MainTask): string => {
  // First, check if task has a month field
  if (task.month) {
    return task.month;
  }
  
  // Check for date field (common in MongoDB tasks)
  if ('date' in task && (task as any).date) {
    const dateValue = (task as any).date;
    // Handle MongoDB date format { $date: "..." } or direct date string
    const dateString = typeof dateValue === 'object' && dateValue.$date ? dateValue.$date : dateValue;
    const taskDate = new Date(dateString);
    if (!isNaN(taskDate.getTime())) {
      return taskDate.toLocaleString('default', { month: 'long' });
    }
  }
  
  // Check for createdAt field
  if (task.createdAt) {
    const createdDate = new Date(task.createdAt);
    if (!isNaN(createdDate.getTime())) {
      return createdDate.toLocaleString('default', { month: 'long' });
    }
  }
  
  // Check for dueDate field
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    if (!isNaN(dueDate.getTime())) {
      return dueDate.toLocaleString('default', { month: 'long' });
    }
  }
  
  // Fallback to current month
  return new Date().toLocaleString('default', { month: 'long' });
};

export function ExportDialog({ allTasks, allLeaves }: ExportDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  
  // Get current date for defaults
  const getCurrentMonth = () => {
    return new Date().toLocaleString('default', { month: 'long' });
  };
  
  const getCurrentYear = () => {
    return new Date().getFullYear().toString();
  };
  
  const getCurrentQuarter = () => {
    const currentMonth = getCurrentMonth();
    const monthMap: { [key: string]: string } = {
      'April': 'Q1', 'May': 'Q1', 'June': 'Q1',
      'July': 'Q2', 'August': 'Q2', 'September': 'Q2',
      'October': 'Q3', 'November': 'Q3', 'December': 'Q3',
      'January': 'Q4', 'February': 'Q4', 'March': 'Q4'
    };
    return monthMap[currentMonth] || 'Q1';
  };

  // Export options with current date defaults
  const [exportType, setExportType] = useState<'quarter' | 'month' | 'year'>('month');
  const [selectedQuarter, setSelectedQuarter] = useState<string>(getCurrentQuarter());
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentYear());

  // Available options
  const quarters = [
    { value: 'Q1', label: 'Q1 (Apr-Jun)' },
    { value: 'Q2', label: 'Q2 (Jul-Sep)' },
    { value: 'Q3', label: 'Q3 (Oct-Dec)' },
    { value: 'Q4', label: 'Q4 (Jan-Mar)' },
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = ['2023', '2024', '2025', '2026'];

  const checkDataAndExport = async () => {
    let filteredTasks: MainTask[] = [];
    let periodLabel = '';

    // Filter tasks based on export type
    if (exportType === 'quarter') {
      const quarterMonths = getMonthsInQuarter(selectedQuarter);
      filteredTasks = allTasks.filter(task => {
        const taskMonth = getMonthFromTask(task);
        return quarterMonths.includes(taskMonth);
      });
      periodLabel = `${selectedQuarter} ${selectedYear}`;
    } else if (exportType === 'month') {
      filteredTasks = allTasks.filter(task => {
        const taskMonth = getMonthFromTask(task);
        return taskMonth === selectedMonth;
      });
      periodLabel = `${selectedMonth} ${selectedYear}`;
    } else if (exportType === 'year') {
      // For year, we'll include all tasks (you can add year filtering logic if needed)
      filteredTasks = allTasks;
      periodLabel = selectedYear;
    }

    // Check if filtered tasks is empty
    if (filteredTasks.length === 0) {
      setWarningMessage(`No task data found for ${periodLabel}. The exported Excel file will be empty.`);
      setShowWarning(true);
      return;
    }

    // If data exists, proceed with export
    await handleExport(filteredTasks, periodLabel);
  };

  const handleExport = async (filteredTasks: MainTask[], periodLabel: string) => {
    try {
      setIsExporting(true);

      // Convert to analytics format
      const analyticsTasksData = filteredTasks.map(convertToAnalyticsTask);

      // Filter leaves based on the selected period
      let filteredLeaves: string[] = [];
      if (exportType === 'quarter') {
        const quarterMonths = getMonthsInQuarter(selectedQuarter);
        const currentYear = parseInt(selectedYear);
        
        filteredLeaves = allLeaves.filter(leaveDate => {
          const leave = new Date(leaveDate);
          const leaveMonth = leave.toLocaleString('default', { month: 'long' });
          const leaveYear = leave.getFullYear();
          return quarterMonths.includes(leaveMonth) && leaveYear === currentYear;
        });
      } else if (exportType === 'month') {
        const currentYear = parseInt(selectedYear);
        const monthIndex = months.indexOf(selectedMonth);
        
        filteredLeaves = allLeaves.filter(leaveDate => {
          const leave = new Date(leaveDate);
          return leave.getMonth() === monthIndex && leave.getFullYear() === currentYear;
        });
      } else {
        // For year, filter leaves by year
        const currentYear = parseInt(selectedYear);
        filteredLeaves = allLeaves.filter(leaveDate => {
          const leave = new Date(leaveDate);
          return leave.getFullYear() === currentYear;
        });
      }

      // Calculate metrics for the filtered data
      const metrics = calculateProductivityMetrics(
        analyticsTasksData, 
        filteredLeaves, 
        exportType === 'quarter' ? selectedQuarter : exportType === 'month' ? selectedMonth : 'all',
        exportType === 'quarter'
      );

      // Prepare analytics data
      const analyticsData = {
        metrics,
        trends: [], // You can add trends calculation here if needed
        leaves: filteredLeaves,
      };

      // Get projects data for integration links
      const projects = await projectService.getProjects();

      // Generate meaningful filename based on selection
      let filename = '';
      if (exportType === 'quarter') {
        filename = `TaskFlow_${selectedQuarter}_${selectedYear}`;
      } else if (exportType === 'month') {
        filename = `TaskFlow_${selectedMonth}_${selectedYear}`;
      } else if (exportType === 'year') {
        filename = `TaskFlow_Year_${selectedYear}`;
      }

      // Export with filtered data and custom filename
      await exportTasksAndAnalyticsToExcel(analyticsTasksData, analyticsData, projects, filename);

      toast({
        title: 'Export Successful',
        description: `${periodLabel} data has been exported to Excel successfully.`,
      });

      setIsOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export to Excel
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Export Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Type</Label>
            <RadioGroup value={exportType} onValueChange={(value) => setExportType(value as 'quarter' | 'month' | 'year')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quarter" id="quarter" />
                <Label htmlFor="quarter" className="cursor-pointer">Quarter wise (Q1, Q2, Q3, Q4)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="month" id="month" />
                <Label htmlFor="month" className="cursor-pointer">Month wise (January, February, etc.)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="year" id="year" />
                <Label htmlFor="year" className="cursor-pointer">Year wise (2024, 2025, etc.)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Period Selection */}
          <div className="space-y-4">
            {exportType === 'quarter' && (
              <div className="space-y-2">
                <Label htmlFor="quarter-select">Select Quarter</Label>
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger id="quarter-select">
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    {quarters.map((quarter) => (
                      <SelectItem key={quarter.value} value={quarter.value}>
                        {quarter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {exportType === 'month' && (
              <div className="space-y-2">
                <Label htmlFor="month-select">Select Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month-select">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Year Selection (always shown) */}
            <div className="space-y-2">
              <Label htmlFor="year-select">Select Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year-select">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">Export Summary</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {exportType === 'quarter' && `Exporting ${selectedQuarter} (${getMonthsInQuarter(selectedQuarter).join(', ')}) data for ${selectedYear}`}
              {exportType === 'month' && `Exporting ${selectedMonth} ${selectedYear} data`}
              {exportType === 'year' && `Exporting all data for ${selectedYear}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={checkDataAndExport} disabled={isExporting} className="flex items-center gap-2">
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Excel
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Warning Dialog for Empty Data */}
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-amber-500" />
            No Data Found
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {warningMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 my-4">
          <div className="flex items-start gap-2">
            <div className="text-amber-600 dark:text-amber-400 mt-0.5">⚠️</div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                What this means:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• The Excel file will contain headers but no task data</li>
                <li>• Productivity metrics will show zero values</li>
                <li>• You might want to select a different time period</li>
              </ul>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowWarning(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={async () => {
              setShowWarning(false);
              // Proceed with export even with empty data
              let filteredTasks: MainTask[] = [];
              let periodLabel = '';
              
              if (exportType === 'quarter') {
                periodLabel = `${selectedQuarter} ${selectedYear}`;
              } else if (exportType === 'month') {
                periodLabel = `${selectedMonth} ${selectedYear}`;
              } else if (exportType === 'year') {
                periodLabel = selectedYear;
              }
              
              await handleExport(filteredTasks, periodLabel);
            }}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Download Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}