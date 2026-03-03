const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const index = line.indexOf('=');
  if (index !== -1) {
    const key = line.substring(0, index).trim();
    const value = line.substring(index + 1).trim();
    env[key] = value;
  }
});

const uri = env.MONGODB_URI;
const dbName = env.MONGODB_DB || 'sms';
const adminEmail = 'tanmoypal99cse@gmail.com'; // Use one of the admin emails

async function testAdminLogin() {
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  console.log('🔄 Attempting to connect to MongoDB...');
  
  try {
    await mongoose.connect(uri, { dbName });
    console.log('✅ Connected successfully!');
    
    // Check if the admin email is in the allowed list
    const allowedAdmins = env.ADMIN_EMAILS ? env.ADMIN_EMAILS.split(',') : [];
    console.log('📧 Allowed Admins:', allowedAdmins);
    
    if (allowedAdmins.includes(adminEmail)) {
        console.log(`✅ Admin email ${adminEmail} is authorized.`);
    } else {
        console.error(`❌ Admin email ${adminEmail} is NOT authorized.`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

testAdminLogin();
