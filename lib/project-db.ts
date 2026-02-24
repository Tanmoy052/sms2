import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Project } from "@/lib/types";

export async function getProjectsFromDB(): Promise<Project[]> {
  try {
    const { db } = await connectToDatabase();
    const projects = await db.collection("projects").find({}).toArray();
    return projects.map((item) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
    })) as Project[];
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      { $set: { ...data, updatedAt: new Date().toISOString() } },
      { returnDocument: "after" }
    );
    if (result) {
      return {
        ...result,
        id: result._id.toString(),
        _id: undefined,
      } as Project;
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
