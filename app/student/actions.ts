"use server";

import { revalidatePath } from "next/cache";
import { updateStudentPassword } from "@/lib/student-db";
import { getSession } from "@/lib/auth";

export async function updateStudentAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "Unauthorized" };
  }

  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  const success = await updateStudentPassword(session.userId, password);

  if (success) {
    revalidatePath("/student");
    return { success: true };
  }

  return { error: "Failed to update password" };
}
