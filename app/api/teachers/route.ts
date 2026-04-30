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
import { DEPT_SHORT_CODES } from "@/lib/types";

export const dynamic = "force-dynamic";

function deriveDefaultTeacherPassword(name: string, department: string) {
  const cleanName = name
    .toLowerCase()
    .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "")
    .trim();
  const firstName = cleanName.split(/\s+/).filter(Boolean)[0] || "teacher";
  let deptShort = DEPT_SHORT_CODES[department] || department.split(" ")[0] || "";
  deptShort = deptShort.toLowerCase();
  return `${firstName}@${deptShort}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");

  const teachers = await getTeachersFromDB();
  const credentials = await getTeacherCredentials();
  const teacherUsernames = new Map(
    credentials.map((c) => [c.teacherId, c.username]),
  );
  const teacherPasswords = new Map(
    credentials.map((c) => [c.teacherId, c.displayPassword || ""]),
  );
  const safeTeachers = teachers.map((t) => ({
    ...t,
    username: teacherUsernames.get(t.id) || "",
    password:
      teacherPasswords.get(t.id) ||
      deriveDefaultTeacherPassword(t.name, t.department),
  }));

  if (department) {
    // Public, login-time lookup: only returns minimal teacher data for selection UI.
    const filteredTeachers = safeTeachers.filter(
      (t) => t.department === department,
    );
    return NextResponse.json({
      teachers: filteredTeachers.map((t) => ({
        id: t.id,
        name: t.name,
        department: t.department,
        designation: t.designation,
        username: t.username || "",
        password: undefined,
      })),
    });
  }

  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;
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
