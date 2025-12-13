import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "sms";

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
    console.error("Error details:", error.message);
    throw error;
  }
}
