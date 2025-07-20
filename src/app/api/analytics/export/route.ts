import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';

type ExportFormat = 'csv' | 'json' | 'xlsx';

interface ExportOptions {
  format: ExportFormat;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  includeTasks: boolean;
  includeProjects: boolean;
}

export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  try {
    const searchParams = new URL(req.url).searchParams;
    
    // Parse export options from query parameters
    const options: ExportOptions = {
      format: (searchParams.get('format') as ExportFormat) || 'json',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      projectId: searchParams.get('projectId') || undefined,
      includeTasks: searchParams.get('includeTasks') !== 'false',
      includeProjects: searchParams.get('includeProjects') !== 'false',
    };

    const { db } = await connectToDatabase();
    const userId = new ObjectId(authResponse.user._id);

    // Build base query for tasks
    const taskMatch: any = { userId };
    
    // Add date range filter if provided
    if (options.startDate || options.endDate) {
      taskMatch.date = {};
      if (options.startDate) taskMatch.date.$gte = new Date(options.startDate);
      if (options.endDate) taskMatch.date.$lte = new Date(options.endDate);
    }

    // Add project filter if provided
    if (options.projectId) {
      taskMatch.projectId = new ObjectId(options.projectId);
    }

    // Prepare data for export
    const exportData: any = {
      metadata: {
        exportedAt: new Date().toISOString(),
        userId: authResponse.user._id,
        format: options.format,
        dateRange: {
          start: options.startDate || 'earliest',
          end: options.endDate || 'latest'
        }
      },
      data: {}
    };

    // Fetch tasks if requested
    if (options.includeTasks) {
      const tasks = await db.collection('tasks')
        .find(taskMatch)
        .sort({ date: -1 })
        .toArray();
      
      // Convert ObjectId to string for JSON serialization
      exportData.data.tasks = tasks.map(task => ({
        ...task,
        _id: task._id.toString(),
        userId: task.userId.toString(),
        projectId: task.projectId.toString(),
        date: task.date.toISOString().split('T')[0]
      }));
    }

    // Fetch projects if requested
    if (options.includeProjects) {
      const projects = await db.collection('projects')
        .find({ userId })
        .toArray();
      
      exportData.data.projects = projects.map(project => ({
        ...project,
        _id: project._id.toString(),
        userId: project.userId.toString(),
        startDate: project.startDate?.toISOString().split('T')[0],
        endDate: project.endDate?.toISOString().split('T')[0],
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }));
    }

    // Format the response based on the requested format
    let response: any;
    let contentType = 'application/json';
    let filename = `analytics-export-${new Date().toISOString().split('T')[0]}`;

    switch (options.format) {
      case 'csv':
        contentType = 'text/csv';
        filename += '.csv';
        
        // Convert tasks to CSV if included
        if (options.includeTasks && exportData.data.tasks) {
          const parser = new Parser();
          exportData.data.tasks = parser.parse(exportData.data.tasks);
        }
        
        // Convert projects to CSV if included
        if (options.includeProjects && exportData.data.projects) {
          const parser = new Parser();
          exportData.data.projects = parser.parse(exportData.data.projects);
        }
        
        response = new NextResponse(JSON.stringify(exportData, null, 2));
        break;

      case 'xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename += '.xlsx';
        
        const wb = XLSX.utils.book_new();
        
        // Add tasks worksheet if included
        if (options.includeTasks && exportData.data.tasks) {
          const ws = XLSX.utils.json_to_sheet(exportData.data.tasks);
          XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
        }
        
        // Add projects worksheet if included
        if (options.includeProjects && exportData.data.projects) {
          const ws = XLSX.utils.json_to_sheet(exportData.data.projects);
          XLSX.utils.book_append_sheet(wb, ws, 'Projects');
        }
        
        const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        response = new NextResponse(xlsxBuffer);
        break;

      case 'json':
      default:
        filename += '.json';
        response = new NextResponse(JSON.stringify(exportData, null, 2));
    }

    // Set response headers for file download
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    return response;
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}
