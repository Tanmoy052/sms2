import { connectToDatabase } from "@/lib/mongodb";
import { type Admin } from "@/lib/types";
import { ADMIN_CREDENTIALS } from "@/lib/constants";

const ADMIN_ID = "1"; // Constant ID for the single admin for now

export async function getAdminCredentials(): Promise<Admin | null> {
  try {
    const { db } = await connectToDatabase();
    const admin = await db.collection("admins").findOne({ id: ADMIN_ID });
    
    if (!admin) {
      // If not in DB, return from constants (seed data)
      return ADMIN_CREDENTIALS[0];
    }

    return {
      id: admin.id,
      username: admin.username,
      password: admin.password,
      name: admin.name,
      role: admin.role,
    };
  } catch (error) {
    console.error("Error fetching admin credentials:", error);
    return ADMIN_CREDENTIALS[0];
  }
}

export async function updateAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    
    // Check if admin exists in DB, if not create from constants first
    const existing = await db.collection("admins").findOne({ id: ADMIN_ID });
    
    if (!existing) {
      await db.collection("admins").insertOne({
        ...ADMIN_CREDENTIALS[0],
        username,
        password,
        updatedAt: new Date(),
      });
      return true;
    }

    const result = await db.collection("admins").updateOne(
      { id: ADMIN_ID },
      { 
        $set: { 
          username, 
          password,
          updatedAt: new Date()
        } 
      }
    );
    
    return result.acknowledged;
  } catch (error) {
    console.error("Error updating admin credentials:", error);
    return false;
  }
}
