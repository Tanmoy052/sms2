"use server";

import { revalidatePath } from "next/cache";
import { updateTeacherCredentialByTeacherId } from "@/lib/teacher-db";
import { getSession } from "@/lib/auth";

export async function updateTeacherAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "teacher") {
    return { error: "Unauthorized" };
  }

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const success = await updateTeacherCredentialByTeacherId(session.userId, {
    username,
    password,
  });

  if (success) {
    revalidatePath("/teacher");
    return { success: true };
  }

  return { error: "Failed to update credentials" };
}
