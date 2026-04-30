import { NextRequest, NextResponse } from "next/server";
import { getAttendanceFromDB, addAttendanceToDB } from "@/lib/attendance-db";
import type { Attendance } from "@/lib/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const AttendanceCreateSchema = z.object({
  studentId: z.string().min(1),
  date: z.string().min(1),
  status: z.enum(["present", "absent", "late"]),
  subject: z.string().min(1),
  markedBy: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const date = searchParams.get("date");
    const subject = searchParams.get("subject");

    let attendance = await getAttendanceFromDB();

    // Filter by studentId if provided
    if (studentId) {
      attendance = attendance.filter((a) => a.studentId === studentId);
    }

    // Filter by date if provided
    if (date) {
      attendance = attendance.filter((a) => a.date === date);
    }

    // Filter by subject if provided
    if (subject) {
      attendance = attendance.filter((a) => a.subject === subject);
    }

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AttendanceCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { studentId, date, status, subject, markedBy } = parsed.data;

    const newAttendance: Omit<Attendance, "id"> = {
      studentId,
      date,
      status,
      subject,
      markedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await addAttendanceToDB(newAttendance);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      { error: "Failed to create attendance" },
      { status: 500 },
    );
  }
}
