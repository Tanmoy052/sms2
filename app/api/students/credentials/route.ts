import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getStudentCredentialByStudentId } from "@/lib/student-db";
import { requireRole } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }
  if (!ObjectId.isValid(studentId)) {
    return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
  }

  const cred = await getStudentCredentialByStudentId(studentId);
  if (!cred) return NextResponse.json(null);
  return NextResponse.json({
    id: cred.id,
    studentId: cred.studentId,
    rollNumber: cred.rollNumber,
    hasPassword: true,
  });
}
