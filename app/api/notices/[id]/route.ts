import { NextResponse } from "next/server"
import { persistentStore } from "@/lib/persistent-store"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await request.json()
  const notice = persistentStore.updateNotice(id, data)
  if (!notice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(notice)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const success = persistentStore.deleteNotice(id)
  if (!success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
