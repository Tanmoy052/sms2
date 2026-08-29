import { NextRequest, NextResponse } from "next/server";
import {
  getStudentsFromDB,
  addStudentToDB,
  getStudentCredentials,
} from "@/lib/student-db";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { StudentCreateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  // Allow both admin and teacher roles to view students
  if (auth.session.role !== "admin" && auth.session.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");
  const semester = searchParams.get("semester");

  let students = await getStudentsFromDB();

  if (department && department !== "all") {
    students = students.filter(
      (s) => s.department.toLowerCase() === department.toLowerCase(),
    );
  }
  if (semester && semester !== "all") {
    students = students.filter((s) => s.semester.toString() === semester);
  }

  // Passwords / display credentials only exposed to admin
  if (auth.session.role === "admin") {
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

  return NextResponse.json(students);
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
