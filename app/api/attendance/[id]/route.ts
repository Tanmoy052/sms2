import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import {
  updateAttendanceInDB,
  deleteAttendanceFromDB,
} from "@/lib/attendance-db";

const AttendanceUpdateSchema = z
  .object({
    studentId: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
    status: z.enum(["present", "absent", "late"]).optional(),
    subject: z.string().min(1).optional(),
    markedBy: z.string().min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid attendance id" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = AttendanceUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const updated = await updateAttendanceInDB(id, parsed.data);
    if (!updated) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update attendance" },
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
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid attendance id" }, { status: 400 });
    }
    const success = await deleteAttendanceFromDB(id);
    if (!success) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete attendance" },
      { status: 500 },
    );
  }
}
