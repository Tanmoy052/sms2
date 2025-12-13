import { NextRequest, NextResponse } from "next/server";
import { getAttendanceFromDB, addAttendanceToDB } from "@/lib/attendance-db";
import type { Attendance } from "@/lib/types";

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
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, date, status, subject, markedBy } = body;

    if (!studentId || !date || !status || !subject || !markedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newAttendance: Omit<Attendance, "id"> = {
      studentId,
      date,
      status,
      subject,
      markedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await addAttendanceToDB(newAttendance);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      { error: "Failed to create attendance" },
      { status: 500 }
    );
  }
}
