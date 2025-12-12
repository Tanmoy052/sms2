import { NextResponse } from "next/server"
import { persistentStore } from "@/lib/persistent-store"

export async function GET() {
  return NextResponse.json(persistentStore.getProjects())
}

export async function POST(request: Request) {
  const data = await request.json()
  const project = persistentStore.addProject(data)
  return NextResponse.json(project)
}
