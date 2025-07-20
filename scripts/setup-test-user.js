const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/daily-task-tracker';

async function setupTestUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const client = await MongoClient.connect(uri);
    const db = client.db();
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Check if test user already exists
    const existingUser = await db.collection('users').findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('ℹ️  Test user already exists');
      console.log('   Email: test@example.com');
      console.log('   Password: password123');
    } else {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('users').insertOne(testUser);
      
      console.log('✅ Test user created successfully');
      console.log('   Email: test@example.com');
      console.log('   Password: password123');
    }
    
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error setting up test user:', error);
    process.exit(1);
  }
}

setupTestUser(); 