import { NextRequest, NextResponse } from "next/server";
import {
  getTeachersFromDB,
  addTeacherToDB,
  addTeacherCredential,
  getTeacherCredentials,
  generateUniqueTeacherCredentials,
} from "@/lib/teacher-db";
import { requireRole } from "@/lib/api-auth";
import { TeacherCreateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");

  const teachers = await getTeachersFromDB();
  const credentials = await getTeacherCredentials();
  const teacherUsernames = new Map(
    credentials.map((c) => [c.teacherId, c.username]),
  );
  const safeTeachers = teachers.map((t) => ({
    ...t,
    username: teacherUsernames.get(t.id) || "",
    password: undefined,
  }));

  if (department) {
    const filteredTeachers = safeTeachers.filter(
      (t) => t.department === department,
    );
    return NextResponse.json({ teachers: filteredTeachers });
  }

  return NextResponse.json(safeTeachers);
}

export async function POST(request: NextRequest) {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = TeacherCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Add teacher to database
    const now = new Date().toISOString();
    const newTeacher = await addTeacherToDB({
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    });

    // Generate and add credentials
    if (newTeacher && newTeacher.id) {
      const { username, password } = await generateUniqueTeacherCredentials(
        newTeacher.name,
        newTeacher.department,
      );

      await addTeacherCredential({
        teacherId: newTeacher.id,
        username,
        password,
      });
    }

    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: "Failed to create teacher" },
      { status: 500 },
    );
  }
}
