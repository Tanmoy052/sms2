import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { updateNoticeInDB, deleteNoticeFromDB } from "@/lib/notice-db";

const NoticeUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    category: z.enum(["general", "academic", "exam", "event"]).optional(),
    publishedAt: z.string().min(1).optional(),
    expiresAt: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid notice id" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = NoticeUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const updatedNotice = await updateNoticeInDB(id, parsed.data);

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
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid notice id" }, { status: 400 });
    }
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
