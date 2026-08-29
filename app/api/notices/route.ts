import { NextRequest, NextResponse } from "next/server";
import { getNoticesFromDB, addNoticeToDB } from "@/lib/notice-db";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NoticeCreateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(["general", "academic", "exam", "event"]),
  publishedAt: z.string().min(1),
  expiresAt: z.string().nullable(),
  isActive: z.boolean(),
});

export async function GET() {
  const notices = await getNoticesFromDB();
  return NextResponse.json(notices);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = NoticeCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const newNotice = await addNoticeToDB(parsed.data);
    return NextResponse.json(newNotice, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create notice" },
      { status: 500 },
    );
  }
}
