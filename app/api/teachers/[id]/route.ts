import { NextRequest, NextResponse } from "next/server";
import {
  updateTeacherInDB,
  deleteTeacherFromDB,
  generateUniqueTeacherCredentials,
  updateTeacherCredentialByTeacherId,
  addTeacherCredential,
  getTeacherCredentialByTeacherId,
  deleteTeacherCredentialsByTeacherId,
} from "@/lib/teacher-db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Update teacher details
    const updatedTeacher = await updateTeacherInDB(id, body);

    if (!updatedTeacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // 2. Check if name or department changed to regenerate credentials
    if (body.name || body.department) {
      console.log(
        `[Teacher Update] Regenerating credentials for ${updatedTeacher.name}`,
      );
      const { username, password } = await generateUniqueTeacherCredentials(
        updatedTeacher.name,
        updatedTeacher.department,
        id,
      );

      console.log(`[Teacher Update] New credentials generated: ${username}`);

      // Check if credentials exist for this teacher
      const existingCred = await getTeacherCredentialByTeacherId(id);

      if (existingCred) {
        console.log(`[Teacher Update] Updating existing credential for ${id}`);
        await updateTeacherCredentialByTeacherId(id, {
          username,
          password,
        });
      } else {
        console.log(`[Teacher Update] Adding new credential for ${id}`);
        await addTeacherCredential({
          teacherId: id,
          username,
          password,
        });
      }

      console.log(
        `Updated credentials for ${updatedTeacher.name}: ${username}`,
      );
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
  try {
    const { id } = await params;
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
