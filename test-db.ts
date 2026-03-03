import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'sms';

async function testConnection() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  console.log('🔄 Attempting to connect to MongoDB...');
  console.log('📍 URI:', MONGODB_URI.replace(/\/\/.*@/, '//****:****@'));
  console.log('📊 Database:', MONGODB_DB);

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully!');
    
    // Check if we can list collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name).join(', '));
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Connection failed!');
    console.error('🔍 Error:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n💡 Tip: This usually means your IP is not whitelisted in MongoDB Atlas.');
      console.log('1. Go to MongoDB Atlas -> Network Access');
      console.log('2. Add "0.0.0.0/0" to allow access from anywhere (for testing)');
    }
    process.exit(1);
  }
}

testConnection();
