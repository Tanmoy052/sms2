import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getStudentCredentialByStudentId } from "@/lib/student-db";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }
  if (!ObjectId.isValid(studentId)) {
    return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
  }
  if (auth.session.role !== "admin" && auth.session.userId !== studentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cred = await getStudentCredentialByStudentId(studentId);
  if (!cred) return NextResponse.json(null);
  return NextResponse.json({
    id: cred.id,
    studentId: cred.studentId,
    rollNumber: cred.rollNumber,
    password: cred.displayPassword || "",
  });
}
