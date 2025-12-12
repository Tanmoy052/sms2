"use server"

import { verifyAdmin, verifyTeacher, verifyStudent, createSession, destroySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { UserRole } from "@/lib/types"

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as UserRole

  if (!username || !password || !role) {
    return { error: "All fields are required" }
  }

  if (role === "admin") {
    const admin = await verifyAdmin(username, password)
    if (!admin) {
      return { error: "Invalid admin credentials" }
    }
    await createSession(admin.id, "admin")
    return { success: true, redirect: "/admin" }
  }

  if (role === "teacher") {
    const teacher = await verifyTeacher(username, password)
    if (!teacher) {
      return { error: "Invalid teacher credentials" }
    }
    await createSession(teacher.id, "teacher")
    return { success: true, redirect: "/teacher" }
  }

  if (role === "student") {
    const student = await verifyStudent(username, password)
    if (!student) {
      return { error: "Invalid student credentials" }
    }
    await createSession(student.id, "student")
    return { success: true, redirect: "/student" }
  }

  return { error: "Invalid role" }
}

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}
