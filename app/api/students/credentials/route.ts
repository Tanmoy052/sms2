import { NextRequest, NextResponse } from "next/server";
import { getStudentCredentialByStudentId } from "@/lib/student-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const cred = await getStudentCredentialByStudentId(studentId);
  return NextResponse.json(cred);
}
