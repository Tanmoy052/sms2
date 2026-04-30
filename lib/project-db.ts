import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Project } from "@/lib/types";

function mapProject(doc: any): Project {
  return {
    id: doc._id.toString(),
    title: String(doc.title ?? ""),
    description: String(doc.description ?? ""),
    studentIds: Array.isArray(doc.studentIds) ? doc.studentIds.map(String) : [],
    studentNames: Array.isArray(doc.studentNames)
      ? doc.studentNames.map(String)
      : [],
    technologies: Array.isArray(doc.technologies)
      ? doc.technologies.map(String)
      : [],
    department: String(doc.department ?? ""),
    year: Number(doc.year ?? new Date().getFullYear()),
    demoUrl: doc.demoUrl ? String(doc.demoUrl) : undefined,
    repoUrl: doc.repoUrl ? String(doc.repoUrl) : undefined,
    githubUrl: doc.githubUrl ? String(doc.githubUrl) : undefined,
    websiteUrl: doc.websiteUrl ? String(doc.websiteUrl) : undefined,
    status: (doc.status as Project["status"]) ?? "ongoing",
  };
}

export async function getProjectsFromDB(): Promise<Project[]> {
  try {
    const { db } = await connectToDatabase();
    const projects = await db.collection("projects").find({}).toArray();
    return projects.map(mapProject);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function addProjectToDB(project: Omit<Project, "id">): Promise<Project> {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("projects").insertOne({
      ...project,
    });
    return {
      ...project,
      id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
}

export async function updateProjectInDB(id: string, data: Partial<Project>): Promise<Project | null> {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("projects").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data } },
      { returnDocument: "after" }
    );
    if (result) {
      return mapProject(result);
    }
    return null;
  } catch (error) {
    console.error("Error updating project:", error);
    return null;
  }
}

export async function deleteProjectFromDB(id: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("projects").deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  } catch (error) {
    console.error("Error deleting project:", error);
    return false;
  }
}
