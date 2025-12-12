import { NextResponse } from "next/server"
import { persistentStore } from "@/lib/persistent-store"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await request.json()
  const project = persistentStore.updateProject(id, data)
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(project)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const success = persistentStore.deleteProject(id)
  if (!success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
