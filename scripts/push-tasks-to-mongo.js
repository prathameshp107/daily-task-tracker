const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'daily-task-tracker';
const COLLECTION_NAME = 'tasks';

// Function to convert MongoDB date object to proper Date object
function parseMongoDate(mongoDateObj) {
  if (mongoDateObj && mongoDateObj.$date) {
    return new Date(mongoDateObj.$date);
  }
  return new Date();
}

// Function to transform task data to MongoDB compatible format
function transformTaskData(tasks) {
  return tasks.map(task => ({
    taskNumber: task.taskNumber,
    date: parseMongoDate(task.date),
    type: task.type || 'Development',
    description: task.description,
    title: task.description, // Add title field for frontend compatibility
    totalHours: task.totalHours || 0,
    approvedHours: task.approvedHours || 0,
    estimatedHours: task.totalHours || 0, // For frontend compatibility
    actualHours: task.approvedHours || 0, // For frontend compatibility
    note: task.note || '',
    projectId: new ObjectId(task.projectId.$oid),
    userId: new ObjectId(task.userId.$oid),
    createdAt: parseMongoDate(task.createdAt),
    updatedAt: parseMongoDate(task.updatedAt),
    status: task.status || 'completed',
    completed: task.status === 'completed', // Set completed based on status
    priority: 'medium', // Default priority
    // Additional fields for better tracking
    month: task.month,
    year: parseMongoDate(task.date).getFullYear()
  }));
}

async function pushTasksToMongo() {
  let client;
  
  try {
    // Read the JSON file
    console.log('📖 Reading jan.json file...');
    const jsonPath = path.join(__dirname, '..', 'jan.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const tasks = JSON.parse(rawData);
    
    console.log(`✅ Found ${tasks.length} tasks to process`);
    
    // Transform the data
    console.log('🔄 Transforming task data...');
    const transformedTasks = transformTaskData(tasks);
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Check existing indexes and drop conflicting ones
    console.log('🔧 Checking existing indexes...');
    try {
      const indexes = await collection.indexes();
      console.log('📋 Existing indexes:', indexes.map(idx => idx.name));
      
      // Drop problematic indexes if they exist
      const problematicIndexes = ['tickerNo_1'];
      for (const indexName of problematicIndexes) {
        try {
          await collection.dropIndex(indexName);
          console.log(`🗑️  Dropped conflicting index: ${indexName}`);
        } catch (err) {
          // Index doesn't exist, which is fine
        }
      }
    } catch (err) {
      console.log('ℹ️  No existing indexes to check');
    }
    
    // Check if tasks already exist (to avoid duplicates)
    console.log('🔍 Checking for existing tasks...');
    const existingTaskNumbers = await collection.distinct('taskNumber');
    const newTasks = transformedTasks.filter(task => 
      !existingTaskNumbers.includes(task.taskNumber)
    );
    
    if (newTasks.length === 0) {
      console.log('ℹ️  All tasks already exist in the database');
      return;
    }
    
    console.log(`📝 Inserting ${newTasks.length} new tasks...`);
    
    // Insert tasks one by one to handle individual errors
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const task of newTasks) {
      try {
        await collection.insertOne(task);
        insertedCount++;
        console.log(`✅ Inserted task: ${task.taskNumber}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  Skipped duplicate task: ${task.taskNumber}`);
          skippedCount++;
        } else {
          console.error(`❌ Error inserting task ${task.taskNumber}:`, error.message);
          throw error;
        }
      }
    }
    
    console.log(`✅ Successfully processed ${newTasks.length} tasks`);
    console.log('📊 Task summary:');
    console.log(`   - Total tasks processed: ${tasks.length}`);
    console.log(`   - New tasks inserted: ${insertedCount}`);
    console.log(`   - Duplicate tasks skipped: ${tasks.length - insertedCount}`);
    
    // Create indexes for better performance (with error handling)
    console.log('🔧 Creating database indexes...');
    try {
      await collection.createIndex({ taskNumber: 1 }, { unique: true });
      console.log('✅ Created taskNumber index');
    } catch (err) {
      console.log('ℹ️  taskNumber index already exists or failed to create');
    }
    
    try {
      await collection.createIndex({ date: 1 });
      await collection.createIndex({ projectId: 1 });
      await collection.createIndex({ userId: 1 });
      await collection.createIndex({ type: 1 }); // Fixed field name
      console.log('✅ Created additional indexes');
    } catch (err) {
      console.log('ℹ️  Some indexes already exist or failed to create');
    }
    
  } catch (error) {
    console.error('❌ Error pushing tasks to MongoDB:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  pushTasksToMongo()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { pushTasksToMongo, transformTaskData };