import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/projects - List all projects for the authenticated user
export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  try {
    const { db } = await connectToDatabase();
    const projects = await db.collection('projects')
      .find({ userId: new ObjectId(authResponse.user._id) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  const { name, description, status = 'active', color = '#3b82f6', startDate, endDate, client } = await req.json();
  
  // Validate required fields
  if (!name) {
    return NextResponse.json(
      { error: 'Project name is required' },
      { status: 400 }
    );
  }

  // Validate status
  const validStatuses = ['active', 'on-hold', 'completed', 'archived'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: 'Invalid project status' },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const now = new Date();
    
    // Check if project with same name already exists for this user
    const existingProject = await db.collection('projects').findOne({
      name,
      userId: new ObjectId(authResponse.user._id)
    });

    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this name already exists' },
        { status: 400 }
      );
    }

    // Create new project
    const project = {
      name,
      description: description || '',
      status,
      color,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      client: client || '',
      userId: new ObjectId(authResponse.user._id),
      createdAt: now,
      updatedAt: now,
      integrations: {}
    };

    const result = await db.collection('projects').insertOne(project);
    
    return NextResponse.json(
      { 
        success: true, 
        data: { ...project, _id: result.insertedId },
        message: 'Project created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
