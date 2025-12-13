import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Attendance } from "@/lib/types";

export async function getAttendanceFromDB(): Promise<Attendance[]> {
  try {
    console.log("🔄 Connecting to database...");
    const { db } = await connectToDatabase();
    console.log("📊 Fetching attendance records...");
    const attendance = await db.collection("attendance").find({}).toArray();
    console.log("✅ Found", attendance.length, "raw records");

    const result = attendance.map((item) => ({
      id: item._id.toString(),
      studentId: item.studentId,
      date: item.date,
      status: item.status,
      subject: item.subject,
      markedBy: item.markedBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })) as Attendance[];

    console.log("📋 Mapped to", result.length, "attendance objects");
    return result;
  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
    return [];
  }
}

export async function addAttendanceToDB(
  attendance: Omit<Attendance, "id">
): Promise<Attendance> {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("attendance").insertOne({
      ...attendance,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return {
      ...attendance,
      id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error adding attendance:", error);
    throw error;
  }
}

export async function updateAttendanceInDB(
  id: string,
  data: Partial<Attendance>
): Promise<Attendance | null> {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("attendance")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...data, updatedAt: new Date() } },
        { returnDocument: "after" }
      );
    if (result) {
      return {
        id: result._id.toString(),
        studentId: result.studentId,
        date: result.date,
        status: result.status,
        subject: result.subject,
        markedBy: result.markedBy,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      } as Attendance;
    }
    return null;
  } catch (error) {
    console.error("Error updating attendance:", error);
    return null;
  }
}

export async function upsertAttendanceInDB(
  studentId: string,
  date: string,
  status: "present" | "absent" | "late",
  subject: string,
  markedBy: string
): Promise<Attendance> {
  try {
    const { db } = await connectToDatabase();
    const existing = await db.collection("attendance").findOne({
      studentId,
      date,
      subject,
    });

    if (existing) {
      // Update existing
      const result = await db.collection("attendance").findOneAndUpdate(
        { _id: existing._id },
        {
          $set: {
            status,
            markedBy,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );
      if (result) {
        return {
          id: result._id.toString(),
          studentId: result.studentId,
          date: result.date,
          status: result.status,
          subject: result.subject,
          markedBy: result.markedBy,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        } as Attendance;
      }
    } else {
      // Insert new
      const newAttendance = {
        studentId,
        date,
        status,
        subject,
        markedBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db.collection("attendance").insertOne(newAttendance);
      return {
        ...newAttendance,
        id: result.insertedId.toString(),
      };
    }
    throw new Error("Failed to upsert attendance");
  } catch (error) {
    console.error("Error upserting attendance:", error);
    throw error;
  }
}

export async function deleteAttendanceFromDB(id: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("attendance").deleteOne({
      _id: new ObjectId(id),
    });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return false;
  }
}
