"use server"

import { destroySession, getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { updateAdminCredentials } from "@/lib/admin-db"

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}

export async function updateAdminAction(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  const success = await updateAdminCredentials(username, password)
  if (success) {
    revalidatePath("/admin")
    return { success: true }
  }

  return { error: "Failed to update credentials" }
}
