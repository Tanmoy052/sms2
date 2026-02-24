import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/stats-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
