// Teacher DB helper functions
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  DEPT_SHORT_CODES,
  type Teacher,
  type TeacherCredentials,
} from "@/lib/types";
import {
  comparePassword,
  hashPassword,
  looksHashedPassword,
} from "@/lib/password";

function mapTeacher(doc: any): Teacher {
  return {
    id: doc._id.toString(),
    name: String(doc.name ?? ""),
    email: String(doc.email ?? ""),
    employeeId: String(doc.employeeId ?? ""),
    department: String(doc.department ?? ""),
    designation: String(doc.designation ?? ""),
    phone: String(doc.phone ?? ""),
    qualification: String(doc.qualification ?? ""),
    specialization: String(doc.specialization ?? ""),
    joiningDate: String(doc.joiningDate ?? ""),
    status: (doc.status as Teacher["status"]) ?? "active",
    photo: doc.photo ? String(doc.photo) : undefined,
    username: doc.username ? String(doc.username) : undefined,
    password: doc.password ? String(doc.password) : undefined,
    createdAt: String(doc.createdAt ?? new Date().toISOString()),
    updatedAt: String(doc.updatedAt ?? new Date().toISOString()),
  };
}

function mapTeacherCredential(doc: any): TeacherCredentials {
  return {
    id: doc._id.toString(),
    teacherId: String(doc.teacherId ?? ""),
    username: String(doc.username ?? ""),
    password: String(doc.password ?? ""),
    displayPassword: doc.displayPassword
      ? String(doc.displayPassword)
      : undefined,
  };
}

export async function getTeachersFromDB(): Promise<Teacher[]> {
  try {
    const { db } = await connectToDatabase();
    await db.collection("teachers").createIndex({ employeeId: 1 }, { unique: true });
    await db.collection("teachers").createIndex({ status: 1 });
    const teachers = await db
      .collection("teachers")
      .find(
        {},
        {
          projection: {
            name: 1,
            email: 1,
            employeeId: 1,
            department: 1,
            designation: 1,
            phone: 1,
            qualification: 1,
            specialization: 1,
            joiningDate: 1,
            status: 1,
            photo: 1,
            username: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      )
      .toArray();
    return teachers.map(mapTeacher);
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
    const safeUpdates = { ...updates };
    if (safeUpdates.password) {
      const plainPassword = safeUpdates.password;
      safeUpdates.password = await hashPassword(plainPassword);
      safeUpdates.displayPassword = plainPassword;
    }
    const result = await db
      .collection("teacher_credentials")
      .updateOne({ teacherId }, { $set: safeUpdates });
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
    return mapTeacher(teacher);
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
    const now = new Date().toISOString();
    const result = await db.collection("teachers").insertOne({
      ...teacher,
      createdAt: now,
      updatedAt: now,
    });
    return {
      ...teacher,
      id: result.insertedId.toString(),
      createdAt: teacher.createdAt ?? now,
      updatedAt: teacher.updatedAt ?? now,
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
      return mapTeacher(result);
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
    return creds.map(mapTeacherCredential);
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
    return mapTeacherCredential(cred);
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
    await db
      .collection("teacher_credentials")
      .createIndex({ username: 1 }, { unique: true });
    await db
      .collection("teacher_credentials")
      .createIndex({ teacherId: 1 }, { unique: true });
    const plainPassword = cred.password;
    const password = await hashPassword(plainPassword);
    const result = await db.collection("teacher_credentials").insertOne({
      ...cred,
      password,
      displayPassword: plainPassword,
    });
    return {
      ...cred,
      password,
      displayPassword: plainPassword,
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
      .findOne({ username });
    if (!cred) return null;
    const storedPassword = String(cred.password ?? "");
    if (!storedPassword) return null;

    if (!looksHashedPassword(storedPassword)) {
      if (storedPassword !== password) return null;
      const hashedPassword = await hashPassword(password);
      await db
        .collection("teacher_credentials")
        .updateOne({
          _id: cred._id,
        }, { $set: { password: hashedPassword, displayPassword: password } });
      cred.password = hashedPassword;
      cred.displayPassword = password;
      return mapTeacherCredential(cred);
    }

    const isValid = await comparePassword(password, storedPassword);
    if (!isValid) return null;
    return mapTeacherCredential(cred);
  } catch (error) {
    console.error("Error verifying teacher credentials:", error);
    return null;
  }
}
