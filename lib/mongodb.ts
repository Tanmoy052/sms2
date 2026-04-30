import { MongoClient, Db } from 'mongodb';
import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is required");
}
const MONGODB_URI: string = mongoUri;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000, // Increase to 15 seconds
      connectTimeoutMS: 20000,
      family: 4, // Force IPv4
    };

    const maskedUri = MONGODB_URI.replace(/\/\/.*@/, '//****:****@');
    console.log('🔄 Attempting Mongoose connection...');
    console.log('📍 Masked URI:', maskedUri);

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected successfully (Mongoose)');
        return mongooseInstance;
      })
      .catch((error: any) => {
        console.error('❌ Mongoose connection failed!');
        console.error('🔍 Error Name:', error.name);
        console.error('📝 Error Message:', error.message);
        if (error.reason) {
          console.error(
            '📋 Error Reason:',
            JSON.stringify(error.reason, null, 2)
          );
        }

        if (error.name === 'MongoServerSelectionError') {
          console.error(
            '💡 Suggestion: Check if your IP is whitelisted in MongoDB Atlas (Network Access -> 0.0.0.0/0).'
          );
        } else if (error.name === 'MongoNetworkError') {
          console.error(
            '💡 Suggestion: Check your internet connection or firewall settings.'
          );
        }
        cached.promise = null; // Reset promise so next call can retry
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 20000,
    family: 4,
  });

  try {
    const maskedUri = MONGODB_URI.replace(/\/\/.*@/, '//****:****@');
    console.log('🔄 Connecting to MongoDB (MongoClient) at', maskedUri);
    await client.connect();
    console.log('✅ MongoDB connected successfully');
    const db = client.db();

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    console.error(
      'Error details:',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}
