
const { MongoClient } = require('mongodb');

async function checkTanmoy() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('sms_db');

    console.log("Searching for Tanmoy Pal in teachers...");
    const teachers = await db.collection('teachers').find({ 
      name: { $regex: /Tanmoy/i } 
    }).toArray();
    console.log("Teachers found:", teachers);

    console.log("\nSearching for credentials...");
    for (const teacher of teachers) {
      const creds = await db.collection('teacher_credentials').findOne({ teacherId: teacher._id.toString() });
      console.log(`Credentials for ${teacher.name} (${teacher._id}):`, creds);
    }
    
    console.log("\nSearching for any username like 'tanmoy'...");
    const allCreds = await db.collection('teacher_credentials').find({ 
        username: { $regex: /tanmoy/i } 
    }).toArray();
    console.log("All 'tanmoy' credentials:", allCreds);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkTanmoy();
