const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Manually parse .env.local
const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const index = line.indexOf("=");
  if (index !== -1) {
    const key = line.substring(0, index).trim();
    const value = line.substring(index + 1).trim();
    env[key] = value;
  }
});

const uri = env.MONGODB_URI;
const dbName = env.MONGODB_DB || "sms";

async function test() {
  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  console.log("🔄 Attempting to connect...");
  console.log("📍 URI:", uri.replace(/\/\/.*@/, "//****:****@"));

  try {
    await mongoose.connect(uri, { dbName });
    console.log("✅ Connected successfully!");
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log("📚 Collections:", collections.map((c) => c.name).join(", "));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  }
}

test();
