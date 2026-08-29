import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  updateTeacherInDB,
  deleteTeacherFromDB,
  generateUniqueTeacherCredentials,
  updateTeacherCredentialByTeacherId,
  addTeacherCredential,
  getTeacherCredentialByTeacherId,
  deleteTeacherCredentialsByTeacherId,
} from "@/lib/teacher-db";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { TeacherUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid teacher id" }, { status: 400 });
    }
    const canEdit =
      auth.session.role === "admin" ||
      (auth.session.role === "teacher" && auth.session.userId === id);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const parsed = TeacherUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // 1. Update teacher details
    const updatedTeacher = await updateTeacherInDB(id, parsed.data);

    if (!updatedTeacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // 2. Check if name or department changed to regenerate credentials
    if (parsed.data.name || parsed.data.department) {
      const { username, password } = await generateUniqueTeacherCredentials(
        updatedTeacher.name,
        updatedTeacher.department,
        id,
      );

      // Check if credentials exist for this teacher
      const existingCred = await getTeacherCredentialByTeacherId(id);

      if (existingCred) {
        await updateTeacherCredentialByTeacherId(id, {
          username,
          password,
        });
      } else {
        await addTeacherCredential({
          teacherId: id,
          username,
          password,
        });
      }
    }

    return NextResponse.json(updatedTeacher);
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: "Failed to update teacher" },
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
      return NextResponse.json({ error: "Invalid teacher id" }, { status: 400 });
    }
    const success = await deleteTeacherFromDB(id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete teacher or teacher not found" },
        { status: 404 },
      );
    }

    // Delete associated credentials
    await deleteTeacherCredentialsByTeacherId(id);

    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 },
    );
  }
}
