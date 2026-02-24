import { NextRequest, NextResponse } from "next/server";
import {
  updateAttendanceInDB,
  deleteAttendanceFromDB,
} from "@/lib/attendance-db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateAttendanceInDB(id, body);
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
