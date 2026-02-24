import { NextRequest, NextResponse } from "next/server";
import { getProjectsFromDB, addProjectToDB } from "@/lib/project-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await getProjectsFromDB();
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newProject = await addProjectToDB(body);
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
