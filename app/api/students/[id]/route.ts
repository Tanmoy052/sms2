import { NextRequest, NextResponse } from "next/server";
import { updateStudentInDB, deleteStudentFromDB } from "@/lib/student-db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedStudent = await updateStudentInDB(id, body);

    if (!updatedStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const success = await deleteStudentFromDB(id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete student or student not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}
