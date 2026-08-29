import { connectToDatabase } from "@/lib/mongodb";
import { type Admin } from "@/lib/types";
import { looksHashedPassword } from "@/lib/password";

const ADMIN_ID = "1"; // Constant ID for the single admin for now

function getEnvAdmin() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "System Administrator";
  const role = "super-admin" as const;

  return { id: ADMIN_ID, username, password, name, role };
}

export async function getAdminCredentials(): Promise<Admin | null> {
  try {
    const { db } = await connectToDatabase();
    const admin = await db.collection("admins").findOne({ id: ADMIN_ID });

    if (!admin) {
      const envAdmin = getEnvAdmin();
      await db.collection("admins").insertOne({
        ...envAdmin,
        displayPassword: envAdmin.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return envAdmin;
    }

    const plainPassword =
      admin.displayPassword ||
      (!looksHashedPassword(admin.password) ? admin.password : (process.env.ADMIN_PASSWORD || "admin123"));

    return {
      id: admin.id,
      username: admin.username,
      password: plainPassword,
      name: admin.name,
      role: admin.role,
    };
  } catch (error) {
    console.error("Error fetching admin credentials:", error);
    return null;
  }
}

export async function updateAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();

    const result = await db.collection("admins").updateOne(
      { id: ADMIN_ID },
      {
        $set: {
          username,
          password: password,
          displayPassword: password,
          name: "System Administrator",
          role: "super-admin",
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return result.acknowledged;
  } catch (error) {
    console.error("Error updating admin credentials:", error);
    return false;
  }
}
