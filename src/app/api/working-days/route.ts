import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

// Default working days configuration (Monday to Friday)
const DEFAULT_WORKING_DAYS = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
  holidays: [] as string[] // Array of dates in 'YYYY-MM-DD' format
};

// GET /api/working-days - Get working days configuration
export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  try {
    const { db } = await connectToDatabase();
    const userId = new ObjectId(authResponse.user._id);

    // Find user's working days configuration
    const config = await db.collection('workingDays').findOne({ userId });

    // If no config exists, return default values
    if (!config) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_WORKING_DAYS,
        isDefault: true
      });
    }

    // Convert ObjectId to string for JSON serialization
    const { _id, ...configData } = config;
    
    return NextResponse.json({
      success: true,
      data: configData.config,
      isDefault: false
    });
  } catch (error) {
    console.error('Error fetching working days configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch working days configuration' },
      { status: 500 }
    );
  }
}

// PUT /api/working-days - Update working days configuration
export async function PUT(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  try {
    const { 
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      holidays
    } = await req.json();

    // Validate the request body
    const weekdays = { monday, tuesday, wednesday, thursday, friday, saturday, sunday };
    
    // Check if all weekdays are boolean values
    const allBooleans = Object.values(weekdays).every(
      value => typeof value === 'boolean' || value === undefined
    );
    
    if (!allBooleans) {
      return NextResponse.json(
        { error: 'All weekday values must be boolean' },
        { status: 400 }
      );
    }

    // Validate holidays array if provided
    if (holidays && !Array.isArray(holidays)) {
      return NextResponse.json(
        { error: 'Holidays must be an array of dates' },
        { status: 400 }
      );
    }

    // Validate each holiday date format (YYYY-MM-DD)
    if (holidays) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const invalidDate = holidays.some(
        (date: string) => !dateRegex.test(date) || isNaN(Date.parse(date))
      );
      
      if (invalidDate) {
        return NextResponse.json(
          { error: 'Invalid date format in holidays. Use YYYY-MM-DD' },
          { status: 400 }
        );
      }
    }

    const { db } = await connectToDatabase();
    const userId = new ObjectId(authResponse.user._id);
    const now = new Date();

    // Prepare the update
    const updateData: any = {
      $set: {
        'config.monday': monday !== undefined ? monday : DEFAULT_WORKING_DAYS.monday,
        'config.tuesday': tuesday !== undefined ? tuesday : DEFAULT_WORKING_DAYS.tuesday,
        'config.wednesday': wednesday !== undefined ? wednesday : DEFAULT_WORKING_DAYS.wednesday,
        'config.thursday': thursday !== undefined ? thursday : DEFAULT_WORKING_DAYS.thursday,
        'config.friday': friday !== undefined ? friday : DEFAULT_WORKING_DAYS.friday,
        'config.saturday': saturday !== undefined ? saturday : DEFAULT_WORKING_DAYS.saturday,
        'config.sunday': sunday !== undefined ? sunday : DEFAULT_WORKING_DAYS.sunday,
        'config.holidays': holidays || [],
        updatedAt: now
      },
      $setOnInsert: {
        userId,
        createdAt: now
      }
    };

    // Update or insert the configuration
    const result = await db.collection('workingDays').updateOne(
      { userId },
      updateData,
      { upsert: true }
    );

    // Get the updated configuration
    const updatedConfig = await db.collection('workingDays').findOne({ userId });

    // Remove _id from the response
    const { _id, ...configData } = updatedConfig;
    
    return NextResponse.json({
      success: true,
      data: configData.config,
      message: 'Working days configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating working days configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update working days configuration' },
      { status: 500 }
    );
  }
}
