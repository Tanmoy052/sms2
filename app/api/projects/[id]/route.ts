import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { updateProjectInDB, deleteProjectFromDB } from "@/lib/project-db";

const ProjectUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    studentIds: z.array(z.string()).optional(),
    studentNames: z.array(z.string()).optional(),
    technologies: z.array(z.string()).optional(),
    department: z.string().min(1).optional(),
    year: z.number().int().min(2000).max(2100).optional(),
    demoUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    websiteUrl: z.string().url().optional(),
    status: z.enum(["ongoing", "completed"]).optional(),
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
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = ProjectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const updatedProject = await updateProjectInDB(id, parsed.data);

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
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
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }
    const success = await deleteProjectFromDB(id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete project or project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
