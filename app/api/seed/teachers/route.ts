import { NextResponse } from "next/server";
import {
  addTeacherToDB,
  getTeachersFromDB,
  addTeacherCredential,
  generateUniqueTeacherCredentials,
  getTeacherCredentials,
} from "@/lib/teacher-db";
import { DEFAULT_TEACHERS, DEFAULT_TEACHER_CREDENTIALS } from "@/lib/seed-data";

export async function POST() {
  try {
    const existingTeachers = await getTeachersFromDB();
    const existingCredentials = await getTeacherCredentials();
    let addedCount = 0;

    for (const teacher of DEFAULT_TEACHERS) {
      // Check if teacher already exists by email or name
      const exists = existingTeachers.find(
        (t) => t.email === teacher.email || t.name === teacher.name
      );

      if (!exists) {
        const { id, ...data } = teacher;
        const newTeacher = await addTeacherToDB(data);
        addedCount++;

        // Check if explicit credentials exist in seed data
        const seedCred = DEFAULT_TEACHER_CREDENTIALS.find(
          (c) => c.teacherId === id
        );

        if (seedCred) {
          await addTeacherCredential({
            teacherId: newTeacher.id,
            username: seedCred.username,
            password: seedCred.password,
          });
        } else {
          // Generate new credentials
          const { username, password } = await generateUniqueTeacherCredentials(
            newTeacher.name,
            newTeacher.department,
            newTeacher.id
          );
          
          await addTeacherCredential({
            teacherId: newTeacher.id,
            username,
            password,
          });
          console.log(`Generated credentials for ${newTeacher.name}: ${username}`);
        }
      } else {
        // Teacher exists, ensure they have credentials
        const credExists = existingCredentials.find(
          (c) => c.teacherId === exists.id
        );
        
        if (!credExists) {
             const { username, password } = await generateUniqueTeacherCredentials(
            exists.name,
            exists.department,
            exists.id
          );
          await addTeacherCredential({
            teacherId: exists.id,
            username,
            password,
          });
          console.log(`Generated missing credentials for existing teacher ${exists.name}: ${username}`);
        }
      }
    }

    return NextResponse.json({ 
      message: "Teachers seeded successfully", 
      added: addedCount 
    });
  } catch (error) {
    console.error("Seeding teachers error:", error);
    return NextResponse.json(
      { error: "Failed to seed teachers" },
      { status: 500 }
    );
  }
}
