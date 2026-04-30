import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Notice } from "@/lib/types";

function mapNotice(doc: any): Notice {
  return {
    id: doc._id.toString(),
    title: String(doc.title ?? ""),
    content: String(doc.content ?? ""),
    category: doc.category as Notice["category"],
    publishedAt: String(doc.publishedAt ?? new Date().toISOString()),
    expiresAt: doc.expiresAt ?? null,
    isActive: Boolean(doc.isActive),
  };
}

export async function getNoticesFromDB(): Promise<Notice[]> {
  try {
    const { db } = await connectToDatabase();
    const notices = await db.collection("notices").find({}).toArray();
    return notices.map(mapNotice);
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
      { $set: { ...data } },
      { returnDocument: "after" }
    );
    if (result) {
      return mapNotice(result);
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
