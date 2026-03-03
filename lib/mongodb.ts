import { MongoClient, Db } from "mongodb";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "sms";

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
      dbName: MONGODB_DB,
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 15000,
      family: 4,
    };

    const maskedUri = MONGODB_URI.replace(/\/\/.*@/, "//****:****@");
    console.log("🔄 Attempting Mongoose connection...");
    console.log("📍 Masked URI:", maskedUri);
    console.log("📊 Target Database:", MONGODB_DB);

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB connected successfully (Mongoose)");
        return mongooseInstance;
      })
      .catch((error: any) => {
        console.error("❌ Mongoose connection failed!");
        console.error("🔍 Error Name:", error.name);
        console.error("📝 Error Message:", error.message);
        if (error.reason) {
          console.error(
            "📋 Error Reason:",
            JSON.stringify(error.reason, null, 2),
          );
        }

        if (error.name === "MongoServerSelectionError") {
          console.error(
            "💡 Suggestion: Check if your IP is whitelisted in MongoDB Atlas (Network Access -> 0.0.0.0/0).",
          );
        } else if (error.name === "MongoNetworkError") {
          console.error(
            "💡 Suggestion: Check your internet connection or firewall settings.",
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

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔄 Connecting to MongoDB at", MONGODB_URI);
    await client.connect();
    console.log("✅ MongoDB connected successfully");
    const db = client.db(MONGODB_DB);
    console.log("📊 Using database:", MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}
