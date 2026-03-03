import { NextRequest, NextResponse } from "next/server";
import {
  getStudentsFromDB,
  addStudentToDB,
  getStudentCredentials,
} from "@/lib/student-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const students = await getStudentsFromDB();
  const credentials = await getStudentCredentials();

  const studentsWithCreds = students.map((s) => {
    const cred = credentials.find((c) => c.studentId === s.id);
    return {
      ...s,
      password: cred?.password || "", // Include password for Admin view
    };
  });

  return NextResponse.json(studentsWithCreds);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newStudent = await addStudentToDB(body);
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}
