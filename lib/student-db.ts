import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Student, StudentCredentials } from "@/lib/types";
import {
  comparePassword,
  hashPassword,
  looksHashedPassword,
} from "@/lib/password";

function mapStudent(doc: any): Student {
  return {
    id: doc._id.toString(),
    name: String(doc.name ?? ""),
    email: String(doc.email ?? ""),
    rollNumber: String(doc.rollNumber ?? ""),
    department: String(doc.department ?? ""),
    semester: Number(doc.semester ?? 1),
    phone: String(doc.phone ?? ""),
    address: String(doc.address ?? ""),
    dateOfBirth: String(doc.dateOfBirth ?? ""),
    admissionYear: Number(doc.admissionYear ?? 0),
    guardianName: String(doc.guardianName ?? ""),
    guardianPhone: String(doc.guardianPhone ?? ""),
    status: (doc.status as Student["status"]) ?? "active",
    photo: doc.photo ? String(doc.photo) : undefined,
    createdAt: String(doc.createdAt ?? new Date().toISOString()),
    updatedAt: String(doc.updatedAt ?? new Date().toISOString()),
  };
}

function mapStudentCredential(doc: any): StudentCredentials {
  return {
    id: doc._id.toString(),
    studentId: String(doc.studentId ?? ""),
    rollNumber: String(doc.rollNumber ?? ""),
    password: String(doc.password ?? ""),
  };
}

export async function getStudentsFromDB(): Promise<Student[]> {
  try {
    const { db } = await connectToDatabase();
    await db.collection("students").createIndex({ rollNumber: 1 }, { unique: true });
    await db.collection("students").createIndex({ status: 1 });
    const students = await db
      .collection("students")
      .find(
        {},
        {
          projection: {
            name: 1,
            email: 1,
            rollNumber: 1,
            department: 1,
            semester: 1,
            phone: 1,
            address: 1,
            dateOfBirth: 1,
            admissionYear: 1,
            guardianName: 1,
            guardianPhone: 1,
            status: 1,
            photo: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      )
      .toArray();
    return students.map(mapStudent);
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function getStudentById(id: string): Promise<Student | null> {
  try {
    const { db } = await connectToDatabase();
    const student = await db
      .collection("students")
      .findOne({ _id: new ObjectId(id) });
    if (!student) return null;
    return mapStudent(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return null;
  }
}

export async function getStudentByRollNumber(
  rollNumber: string,
): Promise<Student | null> {
  try {
    const { db } = await connectToDatabase();
    const student = await db.collection("students").findOne({ rollNumber });
    if (!student) return null;
    return mapStudent(student);
  } catch (error) {
    console.error("Error fetching student by roll number:", error);
    return null;
  }
}

// type for new student payload when inserting into database
export type NewStudent = Omit<Student, "id" | "createdAt" | "updatedAt">;

export async function addStudentToDB(student: NewStudent): Promise<Student> {
  try {
    const { db } = await connectToDatabase();
    const now = new Date().toISOString();
    const result = await db.collection("students").insertOne({
      ...student,
      createdAt: now,
      updatedAt: now,
    });
    return {
      ...student,
      id: result.insertedId.toString(),
      createdAt: now,
      updatedAt: now,
    } as Student;
  } catch (error) {
    console.error("Error adding student:", error);
    throw error;
  }
}

export async function updateStudentInDB(
  id: string,
  data: Partial<Student>,
): Promise<Student | null> {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("students")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...data, updatedAt: new Date().toISOString() } },
        { returnDocument: "after" },
      );
    if (result) {
      return mapStudent(result);
    }
    return null;
  } catch (error) {
    console.error("Error updating student:", error);
    return null;
  }
}

export async function deleteStudentFromDB(id: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("students")
      .deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  } catch (error) {
    console.error("Error deleting student:", error);
    return false;
  }
}

// Student Credentials
export async function getStudentCredentials(): Promise<StudentCredentials[]> {
  try {
    const { db } = await connectToDatabase();
    const creds = await db.collection("student_credentials").find({}).toArray();
    return creds.map(mapStudentCredential);
  } catch (error) {
    console.error("Error fetching student credentials:", error);
    return [];
  }
}

export async function getStudentCredentialByStudentId(
  studentId: string,
): Promise<StudentCredentials | null> {
  try {
    const { db } = await connectToDatabase();
    const cred = await db
      .collection("student_credentials")
      .findOne({ studentId });
    if (!cred) return null;
    return mapStudentCredential(cred);
  } catch (error) {
    console.error("Error fetching student credential:", error);
    return null;
  }
}

export async function addStudentCredential(
  cred: Omit<StudentCredentials, "id">,
): Promise<StudentCredentials> {
  try {
    const { db } = await connectToDatabase();
    await db
      .collection("student_credentials")
      .createIndex({ rollNumber: 1 }, { unique: true });
    await db
      .collection("student_credentials")
      .createIndex({ studentId: 1 }, { unique: true });
    const password = await hashPassword(cred.password);
    const result = await db.collection("student_credentials").insertOne({
      ...cred,
      password,
    });
    return {
      ...cred,
      password,
      id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error adding student credential:", error);
    throw error;
  }
}

export async function updateStudentPassword(
  studentId: string,
  password: string,
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const student = await getStudentById(studentId);
    if (!student) return false;

    const result = await db.collection("student_credentials").updateOne(
      { studentId },
      {
        $set: {
          password: await hashPassword(password),
          rollNumber: student.rollNumber,
        },
      },
      { upsert: true },
    );
    return result.acknowledged;
  } catch (error) {
    console.error("Error updating student password:", error);
    return false;
  }
}

export async function verifyStudentCredentials(
  rollNumber: string,
  password: string,
): Promise<StudentCredentials | null> {
  try {
    const { db } = await connectToDatabase();
    const cred = await db
      .collection("student_credentials")
      .findOne({ rollNumber });
    if (!cred) return null;
    const storedPassword = String(cred.password ?? "");
    if (!storedPassword) return null;

    if (!looksHashedPassword(storedPassword)) {
      if (storedPassword !== password) return null;
      const hashedPassword = await hashPassword(password);
      await db
        .collection("student_credentials")
        .updateOne({ _id: cred._id }, { $set: { password: hashedPassword } });
      cred.password = hashedPassword;
      return mapStudentCredential(cred);
    }

    const isValid = await comparePassword(password, storedPassword);
    if (!isValid) return null;
    return mapStudentCredential(cred);
  } catch (error) {
    console.error("Error verifying student credentials:", error);
    return null;
  }
}
