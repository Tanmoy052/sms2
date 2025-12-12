import { NextResponse } from "next/server"
import { persistentStore } from "@/lib/persistent-store"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const search = url.searchParams
  const studentId = search.get("studentId")
  const date = search.get("date")
  const subject = search.get("subject")
  const department = search.get("department")

  let attendance = persistentStore.getAttendance()

  if (studentId) {
    attendance = attendance.filter((a) => a.studentId === studentId)
  }
  if (date) {
    attendance = attendance.filter((a) => a.date === date)
  }
  if (subject) {
    attendance = attendance.filter((a) => a.subject === subject)
  }
  if (department) {
    const ids = persistentStore.getStudentsByDepartment(department).map((s) => s.id)
    attendance = attendance.filter((a) => ids.includes(a.studentId))
  }

  return NextResponse.json(attendance)
}

export async function POST(request: Request) {
  const data = await request.json()
  const newRecord = persistentStore.addAttendance(data)
  return NextResponse.json(newRecord)
}
