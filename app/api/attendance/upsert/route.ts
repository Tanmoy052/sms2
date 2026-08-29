import { upsertAttendanceInDB } from "@/lib/attendance-db";
import { z } from "zod";

const AttendanceUpsertSchema = z.object({
  studentId: z.string().min(1),
  date: z.string().min(1),
  status: z.enum(["present", "absent", "late"]),
  subject: z.string().min(1),
  markedBy: z.string().min(1),
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = AttendanceUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { studentId, date, status, subject, markedBy } = parsed.data;
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
      {
        error: `Failed to upsert attendance: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
