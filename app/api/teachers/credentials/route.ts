import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getTeacherCredentialByTeacherId } from "@/lib/teacher-db";
import { requireRole } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");

  if (!teacherId) {
    return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
  }
  if (!ObjectId.isValid(teacherId)) {
    return NextResponse.json({ error: "Invalid teacherId" }, { status: 400 });
  }

  const cred = await getTeacherCredentialByTeacherId(teacherId);
  if (!cred) return NextResponse.json(null);
  return NextResponse.json({
    id: cred.id,
    teacherId: cred.teacherId,
    username: cred.username,
    hasPassword: true,
  });
}
