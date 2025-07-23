import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Task } from '../analytics/types';

// Types for analytics data
interface AnalyticsExportData {
  metrics: {
    totalTasks?: number;
    totalWorkingHours?: number;
    totalApprovedHours?: number;
    totalWorkingDaysInMonth?: number;
    totalLeaves?: number;
    effectiveWorkingDays?: number;
    productivity?: number;
  };
  trends: Array<Record<string, string | number>>;
  leaves: string[];
}

export async function exportDashboardAndAnalyticsToExcel(
  tasks: Task[],
  analytics: AnalyticsExportData,
  projects?: Array<{ _id: string; name: string; integrations?: Record<string, unknown> }>
) {
  const workbook = new ExcelJS.Workbook();
  
  // Set workbook properties
  workbook.creator = 'TaskFlow Analytics';
  workbook.lastModifiedBy = 'TaskFlow Analytics';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Sheet 1: Tasks (grouped by month)
  const taskSheet = workbook.addWorksheet('Tasks');
  taskSheet.columns = [
    { header: 'Task Number', key: 'taskNumber', width: 15 },
    { header: 'Task Link', key: 'taskLink', width: 15 },
    { header: 'Type', key: 'taskType', width: 15 },
    { header: 'Description', key: 'description', width: 50 },
    { header: 'Total Hours', key: 'totalHours', width: 12 },
    { header: 'Approved Hours', key: 'approvedHours', width: 15 },
    { header: 'Project', key: 'project', width: 25 },
    { header: 'Month', key: 'month', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Note', key: 'note', width: 40 },
    { header: 'Completed', key: 'completed', width: 12 },
    { header: 'Integration', key: 'integration', width: 15 },
  ];

  // Style header row
  taskSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  taskSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // dark blue-gray
  };
  taskSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Group tasks by month
  const tasksByMonth: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    if (!tasksByMonth[task.month]) tasksByMonth[task.month] = [];
    tasksByMonth[task.month].push(task);
  });

  // Helper function to generate task link and integration type
  const generateTaskLink = (task: Task) => {
    const taskNumber = (task as { taskNumber?: string; taskId?: string }).taskNumber || task.taskId;
    if (!taskNumber || !projects) return { link: '', integration: 'None' };

    // Find project by matching task project name or ID
    const project = projects.find(p =>
      p.name === task.project ||
      p._id === (task as { projectId?: string }).projectId
    );

    if (!project?.integrations) return { link: '', integration: 'None' };

    // Check for Jira integration first
    const jira = project.integrations.jira as { url?: string; projectKey?: string } | undefined;
    const jiraUrl = jira?.url;
    const jiraKey = jira?.projectKey;
    if (jiraUrl && jiraKey) {
      const link = `${jiraUrl.replace(/\/$/, '')}/${jiraKey}-${taskNumber}`;
      return { link, integration: 'Jira' };
    }

    // Check for Redmine integration
    const redmine = project.integrations.redmine as { url?: string } | undefined;
    let redmineUrl = redmine?.url;
    if (redmineUrl) {
      // Use the same hardcoded URL as frontend for consistency
      redmineUrl = 'https://rm.virtuaresearch.com';
      const link = `${redmineUrl.replace(/\/$/, '')}/issues/${taskNumber}`;
      return { link, integration: 'Redmine' };
    }

    return { link: '', integration: 'None' };
  };

  let rowIdx = 2;
  Object.entries(tasksByMonth).forEach(([month, monthTasks], i) => {
    // Add month title row
    const monthRow = taskSheet.addRow([`${month} (${monthTasks.length} tasks)`]);
    monthRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
    monthRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }, // blue
    };
    monthRow.alignment = { vertical: 'middle', horizontal: 'left' };
    taskSheet.mergeCells(`A${rowIdx}:L${rowIdx}`);
    rowIdx++;

    // Add tasks for this month
    monthTasks.forEach((task, j) => {
      const { link, integration } = generateTaskLink(task);
      const taskNumber = (task as { taskNumber?: string; taskId?: string }).taskNumber || task.taskId;
      
      const taskData = {
        taskNumber: taskNumber,
        taskLink: taskNumber, // Show task number like in UI
        taskType: task.taskType || 'Task',
        description: task.description || '',
        totalHours: task.totalHours || 0,
        approvedHours: task.approvedHours || 0,
        project: task.project || 'Unknown',
        month: task.month || '',
        status: task.status || 'pending',
        note: task.note || '',
        completed: task.completed ? 'Yes' : 'No',
        integration: integration,
      };

      const row = taskSheet.addRow(taskData);
      
      // Add hyperlink if external link exists - show task number but link to external URL
      if (link && integration !== 'None') {
        const linkCell = row.getCell('taskLink');
        linkCell.value = {
          text: taskNumber, // Display task number like in UI
          hyperlink: link,  // But link to the actual URL
        };
        linkCell.font = { 
          color: { argb: integration === 'Jira' ? 'FF0066CC' : 'FFCC0000' }, 
          underline: true 
        };
      } else {
        // For tasks without integration, just show the task number
        const linkCell = row.getCell('taskLink');
        linkCell.value = taskNumber;
        linkCell.font = { color: { argb: 'FF6B7280' } }; // Gray color like in UI
      }
      
      // Alternate row color
      if ((j % 2) === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }, // very light gray
        };
      }
      
      // Apply center alignment to specific columns
      row.getCell('taskNumber').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('taskLink').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('month').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('totalHours').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('approvedHours').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('completed').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('integration').alignment = { vertical: 'middle', horizontal: 'center' };
      
      // Color code integration column
      const integrationCell = row.getCell('integration');
      if (integration === 'Jira') {
        integrationCell.font = { color: { argb: 'FF0066CC' }, bold: true };
      } else if (integration === 'Redmine') {
        integrationCell.font = { color: { argb: 'FFCC0000' }, bold: true };
      } else {
        integrationCell.font = { color: { argb: 'FF6B7280' } };
      }
      
      rowIdx++;
    });

    // Add summary row for the month
    const summaryRow = taskSheet.addRow([
      '', // taskNumber
      `Month Summary: ${monthTasks.length} tasks`, // taskLink
      '', // taskType
      '', // description
      monthTasks.reduce((sum, t) => sum + (t.totalHours || 0), 0), // totalHours
      monthTasks.reduce((sum, t) => sum + (t.approvedHours || 0), 0), // approvedHours
      '', // project
      '', // month
      '', // status
      '', // note
      `${monthTasks.filter(t => t.completed).length}/${monthTasks.length}`, // completed
      '', // integration
    ]);
    
    summaryRow.font = { bold: true, color: { argb: 'FF1F2937' } };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }, // light gray
    };
    
    rowIdx++;
    
    // Add a blank row after each month
    taskSheet.addRow([]);
    rowIdx++;
  });

  // Auto-fit all columns in the Tasks sheet
  taskSheet.columns.forEach((column, index) => {
    let maxLength = 10; // Minimum width
    
    // Check header length
    const headerCell = taskSheet.getCell(1, index + 1);
    if (headerCell.value) {
      maxLength = Math.max(maxLength, String(headerCell.value).length);
    }
    
    // Check all data cells in this column
    taskSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const cell = row.getCell(index + 1);
        if (cell.value) {
          const cellLength = String(cell.value).length;
          maxLength = Math.max(maxLength, cellLength);
        }
      }
    });
    
    // Set column width with some padding
    column.width = Math.min(maxLength + 3, 60); // Max width of 60 to prevent extremely wide columns
  });

  // Sheet 2: Analytics - Enhanced Productivity Overview
  const analyticsSheet = workbook.addWorksheet('Productivity Analytics');
  
  // Set up columns with fixed widths for better layout
  analyticsSheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 18 },
    { header: 'Details', key: 'details', width: 35 },
  ];

  let currentRow = 1;
  currentRow++;

  // Title Section - Merge A, B, C cells and center the text in row 1
  const titleRow = analyticsSheet.addRow(['PRODUCTIVITY OVERVIEW', '', '']);
  analyticsSheet.mergeCells(`A${currentRow}:C${currentRow}`);
  titleRow.font = { 
    bold: true, 
    size: 18, 
    color: { argb: 'FFFFFFFF' } 
  };
  titleRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E40AF' }, // Deep blue
  };
  titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
  analyticsSheet.getRow(currentRow).height = 35;
  currentRow++;

  // Add spacing
  analyticsSheet.addRow(['', '', '']);
  currentRow++;

  // Productivity Metrics with enhanced styling
  const metricsData = [
    { 
      metric: '🎯 Total Tasks', 
      value: analytics.metrics.totalTasks || 0, 
      details: 'Total tasks completed this period' 
    },
    { 
      metric: '⏱️ Total Working Hours', 
      value: `${analytics.metrics.totalWorkingHours || 0}h`, 
      details: 'Total hours invested in tasks' 
    },
    { 
      metric: '✅ Approved Hours', 
      value: `${analytics.metrics.totalApprovedHours || 0}h`, 
      details: 'Hours approved and validated' 
    },
    { 
      metric: '📅 Working Days in Month', 
      value: `${analytics.metrics.totalWorkingDaysInMonth || 0} days`, 
      details: 'Available working days (excluding weekends)' 
    },
    { 
      metric: '🏖️ Leaves Taken', 
      value: `${analytics.metrics.totalLeaves || 0} days`, 
      details: 'Total leave days taken this month' 
    },
    { 
      metric: '💼 Effective Working Days', 
      value: `${analytics.metrics.effectiveWorkingDays || 0} days`, 
      details: 'Working days minus leaves taken' 
    },
  ];

  metricsData.forEach((metric, index) => {
    const row = analyticsSheet.addRow([metric.metric, metric.value, metric.details]);
    
    // Alternate row colors
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' }, // Very light gray
      };
    }
    
    // Style metric name
    row.getCell(1).font = { bold: true, size: 11 };
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    
    // Style value
    row.getCell(2).font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Style details
    row.getCell(3).font = { size: 10, color: { argb: 'FF6B7280' } };
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
    
    analyticsSheet.getRow(currentRow).height = 20;
    currentRow++;
  });

  // Add spacing
  analyticsSheet.addRow(['', '', '']);
  currentRow++;

  // PRODUCTIVITY HIGHLIGHT SECTION
  const productivityPercentage = Math.round((analytics.metrics.productivity || 0) * 100);
  const productivityRow = analyticsSheet.addRow([`🚀 PRODUCTIVITY SCORE - ${productivityPercentage}%`, '', '']);
  analyticsSheet.mergeCells(`A${productivityRow.number}:C${productivityRow.number}`);
  
  productivityRow.font = { 
    bold: true, 
    size: 20, // Reduced font size from 36 to 20
    color: { argb: productivityPercentage >= 80 ? 'FF059669' : productivityPercentage >= 60 ? 'FFF59E0B' : 'FFDC2626' }
  };
  productivityRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFFF' }, // White background
  };
  productivityRow.alignment = { vertical: 'middle', horizontal: 'center' };
  analyticsSheet.getRow(productivityRow.number).height = 35; // Reduced height from 50 to 35
  
  // Add border around the entire productivity score row (merged cells A:C)
  const borderStyle = { style: 'thick' as ExcelJS.BorderStyle, color: { argb: 'FF1E40AF' } };
  
  // Apply border to the entire merged range - ExcelJS handles merged cells properly
  const productivityCell = analyticsSheet.getCell(`A${productivityRow.number}`);
  productivityCell.border = {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle
  };
  currentRow = productivityRow.number + 1;

  // Productivity Description
  const productivityDesc = analytics.metrics.effectiveWorkingDays 
    ? `Based on ${(analytics.metrics.totalWorkingHours || 0) / 8} work days out of ${analytics.metrics.effectiveWorkingDays} effective working days`
    : 'Productivity calculation based on available data';
    
  const descRow = analyticsSheet.addRow(['', productivityDesc, '']);
  analyticsSheet.mergeCells(`A${currentRow}:C${currentRow}`);
  descRow.font = { 
    size: 12, 
    color: { argb: 'FF6B7280' },
    italic: true
  };
  descRow.alignment = { vertical: 'middle', horizontal: 'center' };
  analyticsSheet.getRow(currentRow).height = 25;
  currentRow++;

  // Add spacing
  analyticsSheet.addRow(['', '', '']);
  analyticsSheet.addRow(['', '', '']);
  currentRow += 2;

  // Trends Section
  if (analytics.trends && analytics.trends.length > 0) {
    const trendsHeaderRow = analyticsSheet.addRow(['📈 PRODUCTIVITY TRENDS', '', '']);
    analyticsSheet.mergeCells(`A${currentRow}:C${currentRow}`);
    trendsHeaderRow.font = { 
      bold: true, 
      size: 14, 
      color: { argb: 'FFFFFFFF' } 
    };
    trendsHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF7C3AED' }, // Purple
    };
    trendsHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
    analyticsSheet.getRow(currentRow).height = 25;
    currentRow++;

    // Trends table headers
    const trendsHeaders = Object.keys(analytics.trends[0]);
    const headerRow = analyticsSheet.addRow(trendsHeaders);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    currentRow++;

    // Trends data
    analytics.trends.forEach((trend, i) => {
      const row = analyticsSheet.addRow(Object.values(trend));
      if (i % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF1F5F9' },
        };
      }
      row.alignment = { vertical: 'middle', horizontal: 'center' };
      currentRow++;
    });
  }

  // Add spacing
  analyticsSheet.addRow(['', '', '']);
  currentRow++;

  // Leaves Section
  if (analytics.leaves && analytics.leaves.length > 0) {
    const leavesHeaderRow = analyticsSheet.addRow([' LEAVE SUMMARY', '', '']);
    analyticsSheet.mergeCells(`A${currentRow}:C${currentRow}`);
    leavesHeaderRow.font = { 
      bold: true, 
      size: 14, 
      color: { argb: 'FFFFFFFF' } 
    };
    leavesHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEA580C' }, // Orange
    };
    leavesHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
    analyticsSheet.getRow(currentRow).height = 25;
    currentRow++;

    analytics.leaves.forEach((leave, i) => {
      const row = analyticsSheet.addRow([`📅 ${leave}`, '', '']);
      if (i % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEF3E2' }, // Light orange
        };
      }
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
      currentRow++;
    });
  }

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