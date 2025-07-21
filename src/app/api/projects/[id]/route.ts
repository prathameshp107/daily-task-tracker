import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/projects/:id - Get project details
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

    // Normalize fields for frontend
    const normalized = {
      ...project,
      startDate: project.startDate ? new Date(project.startDate).toISOString() : null,
      endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
      createdAt: project.createdAt ? new Date(project.createdAt).toISOString() : null,
      updatedAt: project.updatedAt ? new Date(project.updatedAt).toISOString() : null,
      client: project.client || '-',
      status: project.status || '-',
    };

    return NextResponse.json({
      success: true,
      data: normalized
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/:id - Update project
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  const { name, description, status, color, startDate, endDate, client, integrations } = await req.json();
  
  // Validate status if provided
  if (status) {
    const validStatuses = ['active', 'on-hold', 'completed', 'archived'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid project status' },
        { status: 400 }
      );
    }
  }

  try {
    const { db } = await connectToDatabase();
    const updateData: any = { updatedAt: new Date() };
    
    // Only include fields that are provided
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (color) updateData.color = color;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (client !== undefined) updateData.client = client;
    if (integrations !== undefined) updateData.integrations = integrations;

    // Check if project exists and belongs to user
    const existingProject = await db.collection('projects').findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(authResponse.user._id)
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name if name is being updated
    if (name && name !== existingProject.name) {
      const duplicateProject = await db.collection('projects').findOne({
        name,
        userId: new ObjectId(authResponse.user._id),
        _id: { $ne: new ObjectId(params.id) }
      });

      if (duplicateProject) {
        return NextResponse.json(
          { error: 'A project with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Update project
    const result = await db.collection('projects').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    // Normalize fields for frontend
    const project = result;
    const normalized = {
      ...project,
      startDate: project.startDate ? new Date(project.startDate).toISOString() : null,
      endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
      createdAt: project.createdAt ? new Date(project.createdAt).toISOString() : null,
      updatedAt: project.updatedAt ? new Date(project.updatedAt).toISOString() : null,
      client: project.client || '-',
      status: project.status || '-',
    };

    return NextResponse.json({
      success: true,
      data: normalized,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/:id - Delete project
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  try {
    const { db } = await connectToDatabase();
    
    // Check if project exists and belongs to user
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

    // Delete the project
    await db.collection('projects').deleteOne({
      _id: new ObjectId(params.id)
    });

    // Optionally, return the deleted project normalized (if needed)
    // const normalized = {
    //   ...project,
    //   startDate: project.startDate ? new Date(project.startDate).toISOString() : null,
    //   endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
    //   createdAt: project.createdAt ? new Date(project.createdAt).toISOString() : null,
    //   updatedAt: project.updatedAt ? new Date(project.updatedAt).toISOString() : null,
    //   client: project.client || '-',
    //   status: project.status || '-',
    // };

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
      // , data: normalized
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
