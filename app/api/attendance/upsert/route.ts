import {
  getAttendanceData,
  addAttendanceRecord,
  findAttendanceRecord,
  updateAttendanceRecord,
  AttendanceRecord,
} from "@/lib/attendance-storage";

export async function POST(request: Request) {
  const { studentId, date, status, subject, markedBy } = await request.json();

  if (!studentId || !date || !status || !subject || !markedBy) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Find existing record
    const existingRecord = findAttendanceRecord(studentId, date, subject);

    if (existingRecord) {
      // Update existing
      const updated = updateAttendanceRecord(existingRecord.id, {
        status,
        markedBy,
      });
      return Response.json(updated);
    } else {
      // Create new
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        studentId,
        date,
        status,
        subject,
        markedBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addAttendanceRecord(newRecord);
      return Response.json(newRecord);
    }
  } catch (error) {
    console.error("Error upserting attendance:", error);
    return Response.json(
      { error: "Failed to upsert attendance" },
      { status: 500 }
    );
  }
}
