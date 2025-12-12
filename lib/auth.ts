import { cookies } from "next/headers"
import { persistentStore, ADMIN_CREDENTIALS } from "./persistent-store"
import { parseStudentRollNumber } from "./types"
import type { UserRole } from "./types"

const SESSION_COOKIE = "cgec_session"
const ROLE_COOKIE = "cgec_role"

// Admin authentication
export async function verifyAdmin(username: string, password: string) {
  const admin = ADMIN_CREDENTIALS.find((a) => a.username === username && a.password === password)
  return admin || null
}

export async function verifyTeacher(username: string, password: string) {
  // Get credentials from persistent store
  const credentials = persistentStore.getTeacherCredentials()
  let cred = credentials.find((t) => t.username === username && t.password === password)

  if (!cred) {
    // Try to find teacher by generated username pattern
    const teachers = persistentStore.getTeachers()
    const teacher = teachers.find((t) => {
      const generatedUsername = t.name
        .toLowerCase()
        .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "")
        .trim()
        .replace(/\s+/g, ".")
      return generatedUsername === username
    })

    if (teacher && password === "teacher123") {
      // Auto-create credentials if not exists
      cred = persistentStore.addTeacherCredential({
        teacherId: teacher.id,
        username,
        password: "teacher123",
      })
    }
  }

  if (!cred) return null

  const teacher = persistentStore.getTeacherById(cred.teacherId)
  return teacher ? { ...teacher, credId: cred.id } : null
}

export async function verifyStudent(rollNumber: string, password: string) {
  const parsed = parseStudentRollNumber(rollNumber)
  if (!parsed) {
    return null
  }

  if (!password || password.length < 1) {
    return null
  }

  // Check if student exists in persistent store
  let student = persistentStore.getStudentByRollNumber(rollNumber)

  // If student doesn't exist, create a dynamic student record
  if (!student) {
    const studentName = `Student ${parsed.serialNumber}`
    const email = `${rollNumber}@cgec.ac.in`

    student = persistentStore.addStudent({
      name: studentName,
      email,
      rollNumber,
      department: parsed.department,
      semester: parsed.currentSemester,
      phone: "",
      address: "",
      dateOfBirth: "",
      admissionYear: parsed.admissionYear,
      guardianName: "",
      guardianPhone: "",
      status: "active",
    })
  } else {
    // Update semester based on current calculation
    persistentStore.updateStudent(student.id, {
      semester: parsed.currentSemester,
    })
    student = persistentStore.getStudentByRollNumber(rollNumber)!
  }

  return {
    ...student,
    parsedDept: parsed.department,
    currentSemester: parsed.currentSemester,
  }
}

export function parseRollNumber(rollNumber: string) {
  return parseStudentRollNumber(rollNumber)
}

export async function createSession(userId: string, role: UserRole) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  })
  cookieStore.set(ROLE_COOKIE, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  const role = cookieStore.get(ROLE_COOKIE)?.value as UserRole | undefined

  if (!sessionId || !role) return null

  if (role === "admin") {
    const admin = ADMIN_CREDENTIALS.find((a) => a.id === sessionId)
    return admin ? { user: admin, role } : null
  } else if (role === "teacher") {
    const teacher = persistentStore.getTeacherById(sessionId)
    return teacher ? { user: teacher, role } : null
  } else if (role === "student") {
    const student = persistentStore.getStudentById(sessionId)
    return student ? { user: student, role } : null
  }

  return null
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  cookieStore.delete(ROLE_COOKIE)
}
