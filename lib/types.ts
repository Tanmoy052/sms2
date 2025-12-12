export interface Student {
  id: string
  name: string
  email: string
  rollNumber: string // Format: 34900123052 (349=college, 001=dept, 23=year, 052=serial)
  department: string
  semester: number
  phone: string
  address: string
  dateOfBirth: string
  admissionYear: number
  guardianName: string
  guardianPhone: string
  status: "active" | "inactive" | "graduated"
  photo?: string // Added photo field for student profile picture
  createdAt: string
  updatedAt: string
}

export interface Attendance {
  id: string
  studentId: string
  date: string
  status: "present" | "absent" | "late"
  subject: string
  markedBy: string // teacher id
  createdAt: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  employeeId: string
  department: string
  designation: string
  phone: string
  qualification: string
  specialization: string
  joiningDate: string
  status: "active" | "on-leave" | "retired"
  photo?: string // Added photo field for teacher profile picture
  createdAt: string
  updatedAt: string
}

export interface Admin {
  id: string
  username: string
  password: string
  name: string
  role: "super-admin" | "admin"
}

export interface Notice {
  id: string
  title: string
  content: string
  category: "general" | "academic" | "exam" | "event"
  publishedAt: string
  expiresAt: string | null
  isActive: boolean
}

export interface Project {
  id: string
  title: string
  description: string
  studentIds: string[]
  studentNames: string[]
  technologies: string[]
  department: string
  year: number
  demoUrl?: string
  repoUrl?: string
  githubUrl?: string
  websiteUrl?: string
  status: "ongoing" | "completed"
}

export interface TeacherCredentials {
  id: string
  teacherId: string
  username: string
  password: string
}

export interface StudentCredentials {
  id: string
  studentId: string
  rollNumber: string // 11-digit roll number as username
  password: string // any password set by student
}

export type UserRole = "admin" | "teacher" | "student"

export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
] as const

export type Department = (typeof DEPARTMENTS)[number]

export const DEPARTMENT_CODES: Record<string, string> = {
  "001": "Computer Science & Engineering",
  "002": "Electronics & Communication Engineering",
  "016": "Electrical Engineering",
  "004": "Mechanical Engineering",
  "005": "Civil Engineering",
}

export const DEPARTMENT_TO_CODE: Record<string, string> = {
  "Computer Science & Engineering": "001",
  "Electronics & Communication Engineering": "002",
  "Electrical Engineering": "016",
  "Mechanical Engineering": "004",
  "Civil Engineering": "005",
}

// Helper function to calculate current semester from admission year
export function calculateSemester(admissionYear: number): number {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12

  // Academic year starts in July
  // First semester: July-December, Second semester: January-June
  const yearsCompleted = currentYear - admissionYear
  const isSecondHalf = currentMonth >= 7 // July onwards = first semester of new academic year

  let semester: number
  if (isSecondHalf) {
    // July-December: First semester of (yearsCompleted + 1)th year
    semester = yearsCompleted * 2 + 1
  } else {
    // January-June: Second semester of (yearsCompleted)th year
    semester = yearsCompleted * 2
  }

  // Cap at 8 semesters (4 years)
  return Math.min(Math.max(semester, 1), 8)
}

// Helper to parse roll number and get student info
export function parseStudentRollNumber(rollNumber: string): {
  isValid: boolean
  collegeCode: string
  deptCode: string
  department: string
  admissionYear: number
  serialNumber: string
  currentSemester: number
} | null {
  if (!rollNumber.match(/^349\d{8}$/)) {
    return null
  }

  const collegeCode = rollNumber.substring(0, 3) // 349
  const deptCode = rollNumber.substring(3, 6) // 001, 002, 016, 004, 005
  const yearCode = rollNumber.substring(6, 8) // 23, 24, 25, etc.
  const serialNumber = rollNumber.substring(8, 11) // 001-999

  const department = DEPARTMENT_CODES[deptCode]
  if (!department) {
    return null
  }

  // Convert 2-digit year to full year (23 -> 2023, 24 -> 2024)
  const admissionYear = 2000 + Number.parseInt(yearCode)
  const currentSemester = calculateSemester(admissionYear)

  return {
    isValid: true,
    collegeCode,
    deptCode,
    department,
    admissionYear,
    serialNumber,
    currentSemester,
  }
}
