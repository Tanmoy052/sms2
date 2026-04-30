import { NextRequest, NextResponse } from "next/server";
import {
  getStudentsFromDB,
  addStudentToDB,
  getStudentCredentials,
} from "@/lib/student-db";
import { requireRole } from "@/lib/api-auth";
import { StudentCreateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  const students = await getStudentsFromDB();
  const credentials = await getStudentCredentials();
  const studentPasswords = new Map(
    credentials.map((c) => [c.studentId, c.displayPassword || ""]),
  );

  const studentsWithPassword = students.map((s) => ({
    ...s,
    password: studentPasswords.get(s.id) || "",
  }));
  return NextResponse.json(studentsWithPassword);
}

export async function POST(request: NextRequest) {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = StudentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const newStudent = await addStudentToDB(parsed.data);
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}
