import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getTeacherCredentialByTeacherId } from "@/lib/teacher-db";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");

  if (!teacherId) {
    return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
  }
  if (!ObjectId.isValid(teacherId)) {
    return NextResponse.json({ error: "Invalid teacherId" }, { status: 400 });
  }
  if (auth.session.role !== "admin" && auth.session.userId !== teacherId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cred = await getTeacherCredentialByTeacherId(teacherId);
  if (!cred) return NextResponse.json(null);
  return NextResponse.json({
    id: cred.id,
    teacherId: cred.teacherId,
    username: cred.username,
    password: cred.displayPassword || "",
  });
}
