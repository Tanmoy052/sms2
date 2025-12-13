// Shared server-side storage for attendance data
// This will persist across API route calls during the server session

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: "present" | "absent" | "late";
  subject: string;
  markedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Global storage - persists during server session
let attendanceData: AttendanceRecord[] = [];

export function getAttendanceData(): AttendanceRecord[] {
  return attendanceData;
}

export function setAttendanceData(data: AttendanceRecord[]): void {
  attendanceData = data;
}

export function addAttendanceRecord(record: AttendanceRecord): void {
  attendanceData.push(record);
}

export function updateAttendanceRecord(
  id: string,
  updates: Partial<AttendanceRecord>
): AttendanceRecord | null {
  const index = attendanceData.findIndex((a) => a.id === id);
  if (index === -1) return null;

  attendanceData[index] = {
    ...attendanceData[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return attendanceData[index];
}

export function deleteAttendanceRecord(id: string): boolean {
  const index = attendanceData.findIndex((a) => a.id === id);
  if (index === -1) return false;

  attendanceData.splice(index, 1);
  return true;
}

export function findAttendanceRecord(
  studentId: string,
  date: string,
  subject: string
): AttendanceRecord | undefined {
  return attendanceData.find(
    (a) => a.studentId === studentId && a.date === date && a.subject === subject
  );
}
