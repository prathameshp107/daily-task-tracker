import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/projects/:id/integrations - Get integrations for a project
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  try {
    const { db } = await connectToDatabase();
    
    // Find project and verify ownership
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(authResponse.user._id)
    }, { projection: { integrations: 1 } });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project.integrations || {}
    });
  } catch (error) {
    console.error('Error fetching project integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project integrations' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/:id/integrations - Update project integrations
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  const { jira, redmine } = await req.json();
  
  // Validate at least one integration is provided
  if (!jira && !redmine) {
    return NextResponse.json(
      { error: 'At least one integration configuration is required' },
      { status: 400 }
    );
  }

  // Validate JIRA integration if provided
  if (jira) {
    if (!jira.url || !jira.email || !jira.apiToken || !jira.projectKey) {
      return NextResponse.json(
        { 
          error: 'JIRA integration requires URL, email, API token, and project key',
          field: 'jira',
          requiredFields: ['url', 'email', 'apiToken', 'projectKey']
        },
        { status: 400 }
      );
    }
  }

  // Validate Redmine integration if provided
  if (redmine) {
    if (!redmine.url || !redmine.apiKey || !redmine.projectId) {
      return NextResponse.json(
        { 
          error: 'Redmine integration requires URL, API key, and project ID',
          field: 'redmine',
          requiredFields: ['url', 'apiKey', 'projectId']
        },
        { status: 400 }
      );
    }
  }

  try {
    const { db } = await connectToDatabase();
    
    // Verify project exists and belongs to user
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(authResponse.user._id)
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Prepare integrations update
    const integrations = {
      ...(project.integrations || {}),
      ...(jira && { jira }),
      ...(redmine && { redmine })
    };

    // Update project with new integrations
    const result = await db.collection('projects').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          integrations,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update project integrations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.integrations || {},
      message: 'Project integrations updated successfully'
    });
  } catch (error) {
    console.error('Error updating project integrations:', error);
    return NextResponse.json(
      { error: 'Failed to update project integrations' },
      { status: 500 }
    );
  }
}
