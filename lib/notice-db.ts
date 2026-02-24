import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Notice } from "@/lib/types";

export async function getNoticesFromDB(): Promise<Notice[]> {
  try {
    const { db } = await connectToDatabase();
    const notices = await db.collection("notices").find({}).toArray();
    return notices.map((item) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
    })) as Notice[];
  } catch (error) {
    console.error("Error fetching notices:", error);
    return [];
  }
}

export async function addNoticeToDB(notice: Omit<Notice, "id">): Promise<Notice> {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("notices").insertOne({
      ...notice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return {
      ...notice,
      id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error adding notice:", error);
    throw error;
  }
}

export async function updateNoticeInDB(id: string, data: Partial<Notice>): Promise<Notice | null> {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("notices").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date().toISOString() } },
      { returnDocument: "after" }
    );
    if (result) {
      return {
        ...result,
        id: result._id.toString(),
        _id: undefined,
      } as Notice;
    }
    return null;
  } catch (error) {
    console.error("Error updating notice:", error);
    return null;
  }
}

export async function deleteNoticeFromDB(id: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("notices").deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  } catch (error) {
    console.error("Error deleting notice:", error);
    return false;
  }
}
