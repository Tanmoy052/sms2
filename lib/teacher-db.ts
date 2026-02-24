// Teacher DB helper functions
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  DEPT_SHORT_CODES,
  type Teacher,
  type TeacherCredentials,
} from "@/lib/types";

export async function getTeachersFromDB(): Promise<Teacher[]> {
  try {
    const { db } = await connectToDatabase();
    const teachers = await db.collection("teachers").find({}).toArray();
    return teachers.map((item) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
    })) as Teacher[];
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
}

export async function updateTeacherCredentialByTeacherId(
  teacherId: string,
  updates: Partial<TeacherCredentials>,
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("teacher_credentials")
      .updateOne({ teacherId }, { $set: updates });
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating teacher credential:", error);
    return false;
  }
}

export async function generateUniqueTeacherCredentials(
  name: string,
  department: string,
  teacherId?: string,
): Promise<{ username: string; password: string }> {
  try {
    const cleanName = name
      .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "")
      .trim();
    const nameParts = cleanName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0]?.toLowerCase() || "teacher";
    const lastName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : "";
    const baseUsername = lastName ? `${firstName}_${lastName}` : firstName;

    let deptShort = DEPT_SHORT_CODES[department];
    if (!deptShort) {
      deptShort = department.split(" ")[0];
    }
    deptShort = deptShort.toLowerCase();

    const password = `${firstName}@${deptShort}`;

    const { db } = await connectToDatabase();

    // Check if username already exists
    // We only need to check usernames, not fetch all credentials
    const existingUsernamesCursor = await db
      .collection("teacher_credentials")
      .find({}, { projection: { username: 1, teacherId: 1 } });

    const existingUsernames = new Set<string>();

    await existingUsernamesCursor.forEach((doc) => {
      if (doc.teacherId !== teacherId) {
        existingUsernames.add(doc.username);
      }
    });

    let username = baseUsername;
    let counter = 1;
    while (existingUsernames.has(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return { username, password };
  } catch (error) {
    console.error("Error generating credentials:", error);
    // Fallback
    return {
      username: name.toLowerCase().replace(/\s+/g, "_"),
      password: "password123",
    };
  }
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  try {
    const { db } = await connectToDatabase();
    const teacher = await db
      .collection("teachers")
      .findOne({ _id: new ObjectId(id) });
    if (!teacher) return null;
    return {
      ...teacher,
      id: teacher._id.toString(),
      _id: undefined,
    } as Teacher;
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return null;
  }
}

export async function addTeacherToDB(
  teacher: Omit<Teacher, "id">,
): Promise<Teacher> {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("teachers").insertOne({
      ...teacher,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return {
      ...teacher,
      id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error adding teacher:", error);
    throw error;
  }
}

export async function updateTeacherInDB(
  id: string,
  data: Partial<Teacher>,
): Promise<Teacher | null> {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("teachers")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...data, updatedAt: new Date().toISOString() } },
        { returnDocument: "after" },
      );
    if (result) {
      return {
        ...result,
        id: result._id.toString(),
        _id: undefined,
      } as Teacher;
    }
    return null;
  } catch (error) {
    console.error("Error updating teacher:", error);
    return null;
  }
}

export async function deleteTeacherFromDB(id: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("teachers")
      .deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return false;
  }
}

// Teacher Credentials
export async function getTeacherCredentials(): Promise<TeacherCredentials[]> {
  try {
    const { db } = await connectToDatabase();
    const creds = await db.collection("teacher_credentials").find({}).toArray();
    return creds.map((item) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
    })) as TeacherCredentials[];
  } catch (error) {
    console.error("Error fetching teacher credentials:", error);
    return [];
  }
}

export async function getTeacherCredentialByTeacherId(
  teacherId: string,
): Promise<TeacherCredentials | null> {
  try {
    const { db } = await connectToDatabase();
    const cred = await db
      .collection("teacher_credentials")
      .findOne({ teacherId });
    if (!cred) return null;
    return {
      ...cred,
      id: cred._id.toString(),
      _id: undefined,
    } as TeacherCredentials;
  } catch (error) {
    console.error("Error fetching teacher credential:", error);
    return null;
  }
}

export async function addTeacherCredential(
  cred: Omit<TeacherCredentials, "id">,
): Promise<TeacherCredentials> {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("teacher_credentials").insertOne(cred);
    return {
      ...cred,
      id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error adding teacher credential:", error);
    throw error;
  }
}

export async function deleteTeacherCredentialsByTeacherId(
  teacherId: string,
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("teacher_credentials")
      .deleteMany({ teacherId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting teacher credentials:", error);
    return false;
  }
}

export async function verifyTeacherCredentials(
  username: string,
  password: string,
): Promise<TeacherCredentials | null> {
  try {
    const { db } = await connectToDatabase();
    const cred = await db
      .collection("teacher_credentials")
      .findOne({ username, password });
    if (!cred) return null;
    return {
      ...cred,
      id: cred._id.toString(),
      _id: undefined,
    } as TeacherCredentials;
  } catch (error) {
    console.error("Error verifying teacher credentials:", error);
    return null;
  }
}
