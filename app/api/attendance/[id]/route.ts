import { NextResponse } from "next/server"
import { dataStore } from "@/lib/store"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await request.json()
  const updated = dataStore.updateAttendance(id, data)
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(updated)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = dataStore.deleteAttendance(id)
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
