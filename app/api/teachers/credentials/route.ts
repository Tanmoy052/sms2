import { NextRequest, NextResponse } from "next/server";
import { getTeacherCredentialByTeacherId } from "@/lib/teacher-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");

  if (!teacherId) {
    return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
  }

  const cred = await getTeacherCredentialByTeacherId(teacherId);
  return NextResponse.json(cred);
}
