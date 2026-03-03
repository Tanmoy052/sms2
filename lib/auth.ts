import { cookies } from "next/headers";
import { parseStudentRollNumber, DEPT_SHORT_CODES } from "./types";
import type { UserRole } from "./types";
import { getAdminCredentials } from "./admin-db";
import { connectToDatabase } from "./mongodb";
import {
  getTeacherCredentials,
  getTeachersFromDB,
  addTeacherCredential,
  getTeacherById,
  verifyTeacherCredentials,
} from "./teacher-db";
import {
  getStudentByRollNumber,
  addStudentToDB,
  updateStudentInDB,
  getStudentById,
  verifyStudentCredentials,
  addStudentCredential,
  // exported type for new student payload
  NewStudent,
} from "./student-db";

const SESSION_COOKIE = "cgec_session";
const ROLE_COOKIE = "cgec_role";

// Admin authentication
export async function verifyAdmin(username: string, password: string) {
  const admin = await getAdminCredentials();
  if (admin && admin.username === username && admin.password === password) {
    return admin;
  }
  return null;
}

export async function verifyTeacher(username: string, password: string) {
  // Get credentials from DB efficiently
  let cred = await verifyTeacherCredentials(username, password);

  if (!cred) {
    // Fallback: Check if valid credentials for a teacher who doesn't have an entry in teacher_credentials yet
    const credentials = await getTeacherCredentials();
    const teachers = await getTeachersFromDB();
    const teachersWithoutCreds = teachers.filter(
      (t) => !credentials.some((c) => c.teacherId === t.id),
    );

    for (const teacher of teachersWithoutCreds) {
      const cleanName = teacher.name
        .toLowerCase()
        .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "")
        .trim();
      const nameParts = cleanName.split(/\s+/).filter(Boolean);
      const firstName = nameParts[0]?.toLowerCase() || "teacher";
      const lastName =
        nameParts.length > 1
          ? nameParts[nameParts.length - 1].toLowerCase()
          : "";
      const baseUsername = lastName ? `${firstName}_${lastName}` : firstName;

      let deptShort = DEPT_SHORT_CODES[teacher.department];
      if (!deptShort) {
        deptShort = teacher.department.split(" ")[0];
      }
      deptShort = deptShort.toLowerCase();

      const expectedPassword = `${firstName}@${deptShort}`;

      if (username === baseUsername && password === expectedPassword) {
        // Create credentials
        cred = await addTeacherCredential({
          teacherId: teacher.id,
          username,
          password,
        });
        break;
      }
    }
  }

  if (!cred) return null;

  const teacher = await getTeacherById(cred.teacherId);
  return teacher ? { ...teacher, credId: cred.id } : null;
}

export async function verifyStudent(rollNumber: string, password: string) {
  const parsed = parseStudentRollNumber(rollNumber);
  if (!parsed) {
    return null;
  }

  if (!password || password.length < 1) {
    return null;
  }

  // Check if student exists in DB
  let student = await getStudentByRollNumber(rollNumber);

  // Check if credentials exist in DB
  const cred = await verifyStudentCredentials(rollNumber, password);

  // If student doesn't exist, create a dynamic student record
  if (!student) {
    const studentName = `Student ${parsed.serialNumber}`;
    const email = `${rollNumber}@cgec.ac.in`;

    student = await addStudentToDB({
      name: studentName,
      email,
      rollNumber,
      department: parsed.department,
      semester: parsed.currentSemester,
      phone: "",
      address: "",
      dateOfBirth: "",
      admissionYear: parsed.admissionYear,
      guardianName: "",
      guardianPhone: "",
      status: "active",
      // satisfy older type systems that expect timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as NewStudent);

    // Also create initial credentials with the password used
    await addStudentCredential({
      studentId: student.id,
      rollNumber,
      password,
    });
  } else {
    // Student exists, check credentials
    if (!cred) {
      // FALLBACK: If student exists in the 'students' collection but has NO entry in 'student_credentials',
      // it means they haven't set a custom password yet.
      // In this case, we allow ANY password to let them log in and then set their password.
      const { db } = await connectToDatabase();
      const anyCredExists = await db
        .collection("student_credentials")
        .findOne({ studentId: student.id });

      if (anyCredExists) {
        // They HAVE a password set, so the one they just entered must be wrong
        return null;
      }

      // No password set yet, so create their first credential with whatever they just typed
      await addStudentCredential({
        studentId: student.id,
        rollNumber,
        password,
      });
    }

    // Update semester based on current calculation
    await updateStudentInDB(student.id, {
      semester: parsed.currentSemester,
    });
    student = await getStudentByRollNumber(rollNumber);
  }

  if (!student) return null;

  return {
    ...student,
    parsedDept: parsed.department,
    currentSemester: parsed.currentSemester,
  };
}

export function parseRollNumber(rollNumber: string) {
  return parseStudentRollNumber(rollNumber);
}

export async function createSession(userId: string, role: UserRole) {
  const cookieStore = await cookies();

  // Set session cookie
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  // Set role cookie (readable by client)
  cookieStore.set(ROLE_COOKIE, role, {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  const role = cookieStore.get(ROLE_COOKIE);

  if (!session || !role) return null;

  const userId = session.value;
  const userRole = role.value as UserRole;
  let user = null;

  if (userRole === "admin") {
    user = await getAdminCredentials();
    // Only return if the IDs match (for single admin setup)
    if (user && user.id !== userId) user = null;
  } else if (userRole === "teacher") {
    user = await getTeacherById(userId);
  } else if (userRole === "student") {
    user = await getStudentById(userId);
  }

  if (!user) return null;

  return {
    userId,
    role: userRole,
    user,
  };
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ROLE_COOKIE);
}
