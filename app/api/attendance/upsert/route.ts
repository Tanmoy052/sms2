import { upsertAttendanceInDB } from "@/lib/attendance-db";

export async function POST(request: Request) {
  const { studentId, date, status, subject, markedBy } = await request.json();

  if (!studentId || !date || !status || !subject || !markedBy) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await upsertAttendanceInDB(
      studentId,
      date,
      status,
      subject,
      markedBy
    );
    return Response.json(result);
  } catch (error) {
    console.error("Error upserting attendance:", error);
    return Response.json(
      { error: "Failed to upsert attendance" },
      { status: 500 }
    );
  }
}
