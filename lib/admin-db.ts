import { connectToDatabase } from "@/lib/mongodb";
import { type Admin } from "@/lib/types";
import { hashPassword } from "@/lib/password";

const ADMIN_ID = "1"; // Constant ID for the single admin for now

function getEnvAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "System Administrator";
  const role = "super-admin" as const;

  if (!username || !password) {
    return null;
  }

  return { id: ADMIN_ID, username, password, name, role };
}

export async function getAdminCredentials(): Promise<Admin | null> {
  try {
    const { db } = await connectToDatabase();
    const admin = await db.collection("admins").findOne({ id: ADMIN_ID });

    if (!admin) {
      const envAdmin = getEnvAdmin();
      if (!envAdmin) return null;
      const hashedPassword = await hashPassword(envAdmin.password);
      await db.collection("admins").insertOne({
        ...envAdmin,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { ...envAdmin, password: hashedPassword };
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
    return null;
  }
}

export async function updateAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const hashedPassword = await hashPassword(password);

    // Check if admin exists in DB, if not create from constants first
    const existing = await db.collection("admins").findOne({ id: ADMIN_ID });

    if (!existing) {
      const envAdmin = getEnvAdmin();
      await db.collection("admins").insertOne({
        id: ADMIN_ID,
        name: envAdmin?.name || "System Administrator",
        role: envAdmin?.role || "super-admin",
        username,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return true;
    }

    const result = await db.collection("admins").updateOne(
      { id: ADMIN_ID },
      { 
        $set: { 
          username,
          password: hashedPassword,
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
