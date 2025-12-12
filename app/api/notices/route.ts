import { NextResponse } from "next/server"
import { persistentStore } from "@/lib/persistent-store"

export async function GET() {
  return NextResponse.json(persistentStore.getNotices())
}

export async function POST(request: Request) {
  const data = await request.json()
  const notice = persistentStore.addNotice(data)
  return NextResponse.json(notice)
}
