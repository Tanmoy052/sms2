import { NextResponse } from "next/server"
import { getAttendanceFromDB, addAttendanceToDB } from "@/lib/attendance-db"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const search = url.searchParams
  const studentId = search.get("studentId")
  const date = search.get("date")
  const subject = search.get("subject")

  let attendance = await getAttendanceFromDB()

  if (studentId) {
    attendance = attendance.filter((a) => a.studentId === studentId)
  }
  if (date) {
    attendance = attendance.filter((a) => a.date === date)
  }
  if (subject) {
    attendance = attendance.filter((a) => a.subject === subject)
  }

  return NextResponse.json(attendance)
}

export async function POST(request: Request) {
  const data = await request.json()
  const newRecord = await addAttendanceToDB(data)
  return NextResponse.json(newRecord)
}
