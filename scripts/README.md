# Task Import Scripts

This directory contains scripts for importing and managing task data in MongoDB.

## Scripts Overview

### `push-tasks-to-mongo.js`
Converts task data from `jan.json` to MongoDB-compatible format and imports it into the database.

## Features

- **Data Transformation**: Converts the JSON data to proper MongoDB format
- **Date Parsing**: Converts date strings like "31-Jan" to proper Date objects
- **Duplicate Prevention**: Checks for existing tasks to avoid duplicates
- **Field Normalization**: Converts field names to camelCase and adds metadata
- **Database Indexing**: Creates performance indexes automatically
- **Error Handling**: Comprehensive error handling and logging

## Data Transformations

The script transforms the original data structure:

**Original Format:**
```json
{
  "taskNumber": "22796",
  "Date": "31-Jan",
  "Task Type": "Develope",
  "Description": "CSS fixes...",
  "Estimate Hours": 4,
  "Approved Hours": 4,
  "Note": "",
  "projectId": { "$oid": "6880ba6077da8aab19829a00" },
  "userId": { "$oid": "6880b94c77da8aab198299fd" }
}
```

**MongoDB Format:**
```json
{
  "taskNumber": "22796",
  "date": "2025-01-31T00:00:00.000Z",
  "taskType": "Development",
  "description": "CSS fixes...",
  "estimateHours": 4,
  "approvedHours": 4,
  "note": "",
  "projectId": ObjectId("6880ba6077da8aab19829a00"),
  "userId": ObjectId("6880b94c77da8aab198299fd"),
  "createdAt": "2025-01-23T...",
  "updatedAt": "2025-01-23T...",
  "status": "completed",
  "month": "Jan",
  "year": 2025
}
```

## Usage

### Prerequisites
1. Make sure MongoDB is running (locally or remote)
2. Update your `.env.local` file with the correct MongoDB URI:
   ```
   MONGODB_URI=mongodb://localhost:27017/daily-task-tracker
   DATABASE_NAME=taskTracker
   ```

### Running the Import

**Option 1: Using npm script (recommended)**
```bash
npm run import-tasks
```

**Option 2: Direct node execution**
```bash
node scripts/push-tasks-to-mongo.js
```

### Environment Variables

The script uses these environment variables:
- `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017`)
- `DATABASE_NAME`: Database name (default: `taskTracker`)

## Database Schema

The script creates a `tasks` collection with the following indexes:
- `taskNumber` (unique)
- `date`
- `projectId`
- `userId`
- `taskType`

## Output

The script provides detailed logging:
```
📖 Reading jan.json file...
✅ Found 22 tasks to process
🔄 Transforming task data...
🔌 Connecting to MongoDB...
🔍 Checking for existing tasks...
📝 Inserting 22 new tasks...
✅ Successfully inserted 22 tasks
📊 Task summary:
   - Total tasks processed: 22
   - New tasks inserted: 22
   - Duplicate tasks skipped: 0
🔧 Creating database indexes...
✅ Database indexes created successfully
🔌 MongoDB connection closed
🎉 Script completed successfully!
```

## Error Handling

The script handles common errors:
- File not found
- Invalid JSON format
- MongoDB connection issues
- Duplicate key errors
- Invalid ObjectId format

## Customization

You can modify the script to:
- Change the collection name
- Add additional fields
- Modify date parsing logic
- Add data validation
- Change the duplicate detection logic