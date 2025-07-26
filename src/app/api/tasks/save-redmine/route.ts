import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

interface AuthUser {
    user: { _id: string | ObjectId }
}

// Type guard for authResponse
function isAuthSuccess(response: unknown): response is AuthUser {
    return (
        typeof response === 'object' &&
        response !== null &&
        'user' in response &&
        typeof (response as { user?: unknown }).user === 'object' &&
        (response as { user?: unknown }).user !== null &&
        (
            typeof ((response as { user: { _id?: unknown } }).user._id) === 'string' ||
            ((response as { user: { _id?: unknown } }).user._id instanceof ObjectId)
        )
    );
}

// POST /api/tasks/save-redmine - Save Redmine tasks to database
export async function POST(req: NextRequest) {
    const authResponse = await authenticateToken(req);

    if ('error' in authResponse) {
        return authResponse;
    }

    if (!isAuthSuccess(authResponse)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResponse.user._id;
    const body = await req.json();
    const { tasks, projectMapping } = body;

    console.log('[SAVE-REDMINE] Request body:', {
        tasksCount: tasks?.length,
        projectMapping,
        firstTask: tasks?.[0],
        allProjectIds: Object.keys(projectMapping || {}),
        allTaskProjectIds: tasks?.map(t => t.project?.id)
    });

    if (!tasks || !Array.isArray(tasks)) {
        console.log('[SAVE-REDMINE] Invalid tasks array:', { tasks, isArray: Array.isArray(tasks) });
        return NextResponse.json(
            { error: 'Tasks array is required' },
            { status: 400 }
        );
    }

    if (tasks.length === 0) {
        console.log('[SAVE-REDMINE] Empty tasks array received');
        return NextResponse.json({
            success: true,
            message: 'No tasks to save',
            data: { saved: 0, created: 0, updated: 0 }
        });
    }

    try {
        const { db } = await connectToDatabase();
        const now = new Date();

        // Test if we can access the redmine_tasks collection
        console.log('[SAVE-REDMINE] Testing database connection...');
        const testResult = await db.collection('redmine_tasks').countDocuments();
        console.log('[SAVE-REDMINE] Current redmine_tasks count:', testResult);

        // Helper function to get month from date string
        const getMonthFromDate = (dateString: string | null): string => {
            if (!dateString) {
                return new Date().toISOString().slice(0, 7); // YYYY-MM format
            }
            try {
                const date = new Date(dateString);
                return date.toISOString().slice(0, 7);
            } catch (error) {
                return new Date().toISOString().slice(0, 7);
            }
        };

        // Helper function to get approved hours from custom fields
        const getApprovedHours = (customFields: any[]): number => {
            if (!customFields || !Array.isArray(customFields)) return 0;

            const approvedHoursField = customFields.find(field =>
                field.name === 'Approved hours' || field.id === 21
            );

            if (approvedHoursField && approvedHoursField.value) {
                const hours = parseFloat(approvedHoursField.value);
                return isNaN(hours) ? 0 : hours;
            }

            return 0;
        };

        // Map Redmine status to task status
        const mapStatus = (redmineStatus: any): string => {
            if (!redmineStatus) return 'pending';

            const statusName = redmineStatus.name.toLowerCase();

            if (redmineStatus.is_closed || statusName.includes('done') || statusName.includes('closed')) {
                return 'completed';
            }

            if (statusName.includes('progress') || statusName.includes('development') || statusName.includes('review')) {
                return 'in-progress';
            }

            return 'pending';
        };

        const savedTasks = [];

        console.log('[SAVE-REDMINE] Processing tasks:', tasks.length);

        for (const redmineTask of tasks) {
            console.log('[SAVE-REDMINE] Processing task:', {
                id: redmineTask.id,
                subject: redmineTask.subject,
                projectId: redmineTask.project?.id,
                projectName: redmineTask.project?.name
            });

            // Find the corresponding project in the user's projects by name and Redmine integration
            let localProject = null;

            // First try to find by project mapping (if provided)
            if (projectMapping && redmineTask.project?.id) {
                const mappedProjectId = projectMapping[redmineTask.project.id];
                if (mappedProjectId) {
                    localProject = await db.collection('projects').findOne({
                        _id: new ObjectId(mappedProjectId),
                        userId: new ObjectId(userId)
                    });
                }
            }

            // If not found by mapping, try to find by project name and automated integration
            if (!localProject && redmineTask.project?.name) {
                localProject = await db.collection('projects').findOne({
                    userId: new ObjectId(userId),
                    name: redmineTask.project.name,
                    'integrations.redmine.integrationMode': 'automated'
                });
                console.log('[SAVE-REDMINE] Found project by name and integration mode:', localProject?._id);
            }

            // If still not found, try to find by Redmine project ID in integrations
            if (!localProject && redmineTask.project?.id) {
                localProject = await db.collection('projects').findOne({
                    userId: new ObjectId(userId),
                    'integrations.redmine.projectId': redmineTask.project.id.toString(),
                    'integrations.redmine.integrationMode': 'automated'
                });
                console.log('[SAVE-REDMINE] Found project by Redmine project ID:', localProject?._id);
            }

            if (!localProject) {
                console.warn(`No local project found for Redmine project ${redmineTask.project?.id} (${redmineTask.project?.name})`);
                continue;
            }

            console.log('[SAVE-REDMINE] Found local project:', {
                localProjectId: localProject._id,
                localProjectName: localProject.name,
                redmineProjectId: redmineTask.project?.id,
                redmineProjectName: redmineTask.project?.name
            });

            // Check if task already exists (by redmine ID and project)
            const existingTask = await db.collection('redmine_tasks').findOne({
                userId: new ObjectId(userId),
                redmineId: redmineTask.id,
                projectId: localProject._id
            });

            const taskData = {
                userId: new ObjectId(userId),
                projectId: localProject._id,
                redmineId: redmineTask.id,
                type: redmineTask.tracker?.name || 'Task',
                description: redmineTask.subject,
                totalHours: redmineTask.spent_hours || 0,
                approvedHours: getApprovedHours(redmineTask.custom_fields),
                status: mapStatus(redmineTask.status),
                note: redmineTask.description || '',
                date: redmineTask.start_date ? new Date(redmineTask.start_date) : now,
                month: getMonthFromDate(redmineTask.start_date),
                taskNumber: redmineTask.id.toString(),
                estimatedHours: redmineTask.estimated_hours || 0,
                actualHours: redmineTask.spent_hours || 0,
                priority: redmineTask.priority?.name.toLowerCase() || 'medium',
                assignedTo: redmineTask.assigned_to?.name || '',
                updatedAt: now,
                // Store original Redmine data for reference
                redmineData: {
                    subject: redmineTask.subject,
                    project: redmineTask.project,
                    tracker: redmineTask.tracker,
                    status: redmineTask.status,
                    priority: redmineTask.priority,
                    author: redmineTask.author,
                    assigned_to: redmineTask.assigned_to,
                    due_date: redmineTask.due_date,
                    created_on: redmineTask.created_on,
                    updated_on: redmineTask.updated_on
                }
            };

            if (existingTask) {
                // Update existing task
                console.log('[SAVE-REDMINE] Updating existing task:', existingTask._id);
                await db.collection('redmine_tasks').updateOne(
                    { _id: existingTask._id },
                    { $set: { ...taskData, updatedAt: now } }
                );
                savedTasks.push({ ...taskData, _id: existingTask._id, action: 'updated' });
            } else {
                // Create new task
                console.log('[SAVE-REDMINE] Creating new task for redmine ID:', redmineTask.id);
                const newTaskData = { ...taskData, createdAt: now };
                const result = await db.collection('redmine_tasks').insertOne(newTaskData);
                console.log('[SAVE-REDMINE] Task created with ID:', result.insertedId);
                savedTasks.push({ ...newTaskData, _id: result.insertedId, action: 'created' });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully saved ${savedTasks.length} tasks to redmine_tasks collection`,
            data: {
                saved: savedTasks.length,
                created: savedTasks.filter(t => t.action === 'created').length,
                updated: savedTasks.filter(t => t.action === 'updated').length
            }
        });

    } catch (error) {
        console.error('Error saving Redmine tasks to database:', error);
        return NextResponse.json(
            { error: 'Failed to save tasks to database' },
            { status: 500 }
        );
    }
}