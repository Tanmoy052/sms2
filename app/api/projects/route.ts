import { NextRequest, NextResponse } from "next/server";
import { getProjectsFromDB, addProjectToDB } from "@/lib/project-db";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ProjectCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  studentIds: z.array(z.string()).default([]),
  studentNames: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  department: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
  demoUrl: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  status: z.enum(["ongoing", "completed"]),
});

export async function GET() {
  const projects = await getProjectsFromDB();
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ProjectCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const newProject = await addProjectToDB(parsed.data);
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
