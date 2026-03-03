import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Student, StudentCredentials } from "@/lib/types";

export async function getStudentsFromDB(): Promise<Student[]> {
  try {
    const { db } = await connectToDatabase();
    const students = await db.collection("students").find({}).toArray();
    return students.map((item) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
    })) as Student[];
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
    return {
      ...student,
      id: student._id.toString(),
      _id: undefined,
    } as Student;
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
    return {
      ...student,
      id: student._id.toString(),
      _id: undefined,
    } as Student;
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
    const result = await db.collection("students").insertOne({
      ...student,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return {
      ...student,
      id: result.insertedId.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      return {
        ...result,
        id: result._id.toString(),
        _id: undefined,
      } as Student;
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
    return creds.map((item) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
    })) as StudentCredentials[];
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
    return {
      ...cred,
      id: cred._id.toString(),
      _id: undefined,
    } as StudentCredentials;
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
    const result = await db.collection("student_credentials").insertOne(cred);
    return {
      ...cred,
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
          password,
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
      .findOne({ rollNumber, password });
    if (!cred) return null;
    return {
      ...cred,
      id: cred._id.toString(),
      _id: undefined,
    } as StudentCredentials;
  } catch (error) {
    console.error("Error verifying student credentials:", error);
    return null;
  }
}
