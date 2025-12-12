import { NextResponse } from "next/server"
import { persistentStore } from "@/lib/persistent-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const department = searchParams.get("department")
  const semester = searchParams.get("semester")

  let students = persistentStore.getStudents()

  // Filter by department if provided
  if (department) {
    students = students.filter((s) => s.department === department)
  }

  // Filter by semester if provided
  if (semester) {
    students = students.filter((s) => s.semester === Number.parseInt(semester))
  }

  return NextResponse.json(students)
}

export async function POST(request: Request) {
  const data = await request.json()
  const student = persistentStore.addStudent(data)
  return NextResponse.json(student)
}
