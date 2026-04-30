import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { updateStudentInDB, deleteStudentFromDB } from "@/lib/student-db";
import { requireRole } from "@/lib/api-auth";
import { StudentUpdateSchema } from "@/lib/validators";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = StudentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const updatedStudent = await updateStudentInDB(id, parsed.data);

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
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
    }
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
