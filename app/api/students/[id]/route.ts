import { NextResponse } from "next/server"
import { persistentStore } from "@/lib/persistent-store"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const student = persistentStore.getStudentById(id)
  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(student)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await request.json()
  const student = persistentStore.updateStudent(id, data)
  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(student)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const success = persistentStore.deleteStudent(id)
  if (!success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
