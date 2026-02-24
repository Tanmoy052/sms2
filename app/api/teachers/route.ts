import { NextRequest, NextResponse } from "next/server";
import {
  getTeachersFromDB,
  addTeacherToDB,
  addTeacherCredential,
  getTeacherCredentials,
  generateUniqueTeacherCredentials,
} from "@/lib/teacher-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");

  const teachers = await getTeachersFromDB();
  const credentials = await getTeacherCredentials();

  const teachersWithCreds = teachers.map((t) => {
    const cred = credentials.find((c) => c.teacherId === t.id);
    return {
      ...t,
      username: cred?.username || "",
      password: cred?.password || "", // Include password for Admin view
    };
  });

  if (department) {
    const filteredTeachers = teachersWithCreds.filter(
      (t) => t.department === department,
    );
    return NextResponse.json({ teachers: filteredTeachers });
  }

  return NextResponse.json(teachersWithCreds);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Add teacher to database
    const newTeacher = await addTeacherToDB(body);

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

      console.log(
        `Generated credentials for ${newTeacher.name}: ${username} / ${password}`,
      );
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
