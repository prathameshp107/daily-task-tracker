import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/daily-task-tracker';

if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not set. Using default localhost connection for development.');
  console.warn('   Please set MONGODB_URI environment variable for production.');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await MongoClient.connect(uri);
    const db = client.db();

    cachedClient = client;
    cachedDb = db;

    console.log('✅ Connected to MongoDB successfully');
    return { client, db };
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 