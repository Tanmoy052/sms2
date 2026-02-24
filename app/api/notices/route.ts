import { NextRequest, NextResponse } from "next/server";
import { getNoticesFromDB, addNoticeToDB } from "@/lib/notice-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const notices = await getNoticesFromDB();
  return NextResponse.json(notices);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newNotice = await addNoticeToDB(body);
    return NextResponse.json(newNotice, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create notice" },
      { status: 500 },
    );
  }
}
