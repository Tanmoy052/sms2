import { NextRequest, NextResponse } from "next/server";
import { updateNoticeInDB, deleteNoticeFromDB } from "@/lib/notice-db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedNotice = await updateNoticeInDB(id, body);

    if (!updatedNotice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    return NextResponse.json(updatedNotice);
  } catch (error) {
    console.error("Error updating notice:", error);
    return NextResponse.json(
      { error: "Failed to update notice" },
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
    const success = await deleteNoticeFromDB(id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete notice or notice not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Error deleting notice:", error);
    return NextResponse.json(
      { error: "Failed to delete notice" },
      { status: 500 },
    );
  }
}
