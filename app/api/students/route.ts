import { NextRequest, NextResponse } from "next/server";
import { getStudentsFromDB, addStudentToDB } from "@/lib/student-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const students = await getStudentsFromDB();
  return NextResponse.json(students);
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
