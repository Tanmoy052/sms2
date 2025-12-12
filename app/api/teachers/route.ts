import { NextResponse } from "next/server"
import { persistentStore } from "@/lib/persistent-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const department = searchParams.get("department")

  let teachers = persistentStore.getTeachers()

  if (department) {
    teachers = teachers.filter((t) => t.department === department)
  }

  const credentials = persistentStore.getTeacherCredentials()

  const teachersWithCredentials = teachers.map((teacher) => {
    const cred = credentials.find((c) => c.teacherId === teacher.id)
    const username =
      cred?.username ||
      teacher.name
        .toLowerCase()
        .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "")
        .trim()
        .replace(/\s+/g, ".")

    return {
      id: teacher.id,
      name: teacher.name,
      username,
      department: teacher.department,
      designation: teacher.designation,
    }
  })

  if (department) {
    return NextResponse.json({ teachers: teachersWithCredentials })
  }

  return NextResponse.json(teachers)
}

export async function POST(request: Request) {
  const data = await request.json()
  // persistentStore.addTeacher automatically creates credentials
  const teacher = persistentStore.addTeacher(data)
  return NextResponse.json(teacher)
}
