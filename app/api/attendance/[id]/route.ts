import {
  updateAttendanceRecord,
  deleteAttendanceRecord,
} from "@/lib/attendance-storage";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();

  try {
    const updated = updateAttendanceRecord(id, data);
    if (!updated) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error) {
    console.error("Error updating attendance:", error);
    return Response.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const deleted = deleteAttendanceRecord(id);
    if (!deleted) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return Response.json(
      { error: "Failed to delete attendance" },
      { status: 500 }
    );
  }
}
