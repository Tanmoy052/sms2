import {
  getAttendanceData,
  addAttendanceRecord,
  AttendanceRecord,
} from "@/lib/attendance-storage";

// Helper function to initialize sample data
function initializeSampleData() {
  if (getAttendanceData().length === 0) {
    const sampleData: AttendanceRecord[] = [
      {
        id: "1",
        studentId: "6",
        date: "2025-12-12",
        status: "absent",
        subject: "ee",
        markedBy: "3",
        createdAt: "2025-12-12T18:34:41.888Z",
        updatedAt: "2025-12-12T18:34:41.888Z",
      },
      {
        id: "2",
        studentId: "7",
        date: "2025-12-12",
        status: "present",
        subject: "ee",
        markedBy: "3",
        createdAt: "2025-12-12T18:34:42.108Z",
        updatedAt: "2025-12-12T18:34:42.108Z",
      },
    ];
    // Note: In a real app, you'd load from database here
    sampleData.forEach((record) => addAttendanceRecord(record));
  }
}

export async function GET(request: Request) {
  try {
    initializeSampleData(); // Initialize sample data if needed

    const url = new URL(request.url);
    const search = url.searchParams;
    const studentId = search.get("studentId");
    const date = search.get("date");
    const subject = search.get("subject");

    let attendance = getAttendanceData();

    if (studentId) {
      attendance = attendance.filter((a) => a.studentId === studentId);
    }
    if (date) {
      attendance = attendance.filter((a) => a.date === date);
    }
    if (subject) {
      attendance = attendance.filter((a) => a.subject === subject);
    }

    return Response.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return Response.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    initializeSampleData(); // Initialize sample data if needed

    const data = await request.json();
    const newRecord: AttendanceRecord = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addAttendanceRecord(newRecord);
    return Response.json(newRecord);
  } catch (error) {
    console.error("Error creating attendance:", error);
    return Response.json(
      { error: "Failed to create attendance" },
      { status: 500 }
    );
  }
}
