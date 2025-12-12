import { NextResponse } from "next/server"
import { persistentStore } from "@/lib/persistent-store"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const teacher = persistentStore.getTeacherById(id)
  if (!teacher) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(teacher)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await request.json()
  const teacher = persistentStore.updateTeacher(id, data)
  if (!teacher) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(teacher)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const success = persistentStore.deleteTeacher(id)
  if (!success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
