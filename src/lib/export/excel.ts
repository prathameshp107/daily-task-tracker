import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Task } from '../analytics/types';

// Types for analytics data
interface AnalyticsExportData {
  metrics: Record<string, any>;
  trends: Array<Record<string, any>>;
  leaves: string[];
}

export async function exportDashboardAndAnalyticsToExcel(
  tasks: Task[],
  analytics: AnalyticsExportData
) {
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Tasks (grouped by month)
  const taskSheet = workbook.addWorksheet('Tasks');
  taskSheet.columns = [
    { header: 'Task ID', key: 'taskId', width: 15 },
    { header: 'Type', key: 'taskType', width: 15 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Total Hours', key: 'totalHours', width: 12 },
    { header: 'Approved Hours', key: 'approvedHours', width: 14 },
    { header: 'Project', key: 'project', width: 20 },
    { header: 'Month', key: 'month', width: 12 },
    { header: 'Note', key: 'note', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Completed', key: 'completed', width: 10 },
  ];

  // Style header row
  taskSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  taskSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // dark blue-gray
  };

  // Group tasks by month
  const tasksByMonth: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    if (!tasksByMonth[task.month]) tasksByMonth[task.month] = [];
    tasksByMonth[task.month].push(task);
  });

  let rowIdx = 2;
  Object.entries(tasksByMonth).forEach(([month, monthTasks], i) => {
    // Add month title row
    const monthRow = taskSheet.addRow([`${month}`]);
    monthRow.font = { bold: true, color: { argb: 'FF2563EB' }, size: 14 };
    monthRow.alignment = { vertical: 'middle', horizontal: 'left' };
    taskSheet.mergeCells(`A${rowIdx}:J${rowIdx}`);
    rowIdx++;
    // Add tasks for this month
    monthTasks.forEach((task, j) => {
      const row = taskSheet.addRow({ ...task });
      // Alternate row color
      if ((j % 2) === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF1F5F9' }, // light gray
        };
      }
      rowIdx++;
    });
    // Add a blank row after each month
    taskSheet.addRow([]);
    rowIdx++;
  });

  // Sheet 2: Analytics
  const analyticsSheet = workbook.addWorksheet('Analytics');
  // Metrics
  analyticsSheet.addRow(['Metrics']);
  analyticsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  analyticsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' }, // blue
  };
  Object.entries(analytics.metrics).forEach(([key, value]) => {
    const row = analyticsSheet.addRow([key, value]);
    row.font = { bold: true };
  });
  analyticsSheet.addRow([]);
  // Trends
  const trendsStart = analyticsSheet.addRow(['Trends']);
  trendsStart.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  trendsStart.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' },
  };
  if (analytics.trends.length > 0) {
    const headerRow = analyticsSheet.addRow(Object.keys(analytics.trends[0]));
    headerRow.font = { bold: true };
    analytics.trends.forEach((trend, i) => {
      const row = analyticsSheet.addRow(Object.values(trend));
      if ((i % 2) === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF1F5F9' },
        };
      }
    });
  }
  analyticsSheet.addRow([]);
  // Leaves
  const leavesStart = analyticsSheet.addRow(['Leaves']);
  leavesStart.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  leavesStart.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' },
  };
  analytics.leaves.forEach((leave) => {
    analyticsSheet.addRow([leave]);
  });

  // After all rows are added to the analyticsSheet, set column widths dynamically
  analyticsSheet.columns.forEach((col, i) => {
    let maxLength = 10;
    analyticsSheet.eachRow((row) => {
      const cell = row.getCell(i + 1);
      const value = cell.value ? String(cell.value) : '';
      if (value.length > maxLength) maxLength = value.length;
    });
    col.width = maxLength + 3;
  });

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), 'dashboard-analytics.xlsx');
} 