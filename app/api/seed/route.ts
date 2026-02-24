import { NextResponse } from "next/server";
import { addStudentToDB, getStudentsFromDB } from "@/lib/student-db";
import {
  addTeacherToDB,
  getTeachersFromDB,
  addTeacherCredential,
  generateUniqueTeacherCredentials,
  getTeacherCredentials,
} from "@/lib/teacher-db";
import { addNoticeToDB, getNoticesFromDB } from "@/lib/notice-db";
import { addProjectToDB, getProjectsFromDB } from "@/lib/project-db";
import {
  DEFAULT_STUDENTS,
  DEFAULT_TEACHERS,
  DEFAULT_NOTICES,
  DEFAULT_PROJECTS,
  DEFAULT_TEACHER_CREDENTIALS,
} from "@/lib/seed-data";

export async function POST() {
  try {
    const results = {
      teachers: 0,
      students: 0,
      notices: 0,
      projects: 0,
    };

    // --- Seed Teachers ---
    const existingTeachers = await getTeachersFromDB();
    const existingCredentials = await getTeacherCredentials();

    for (const teacher of DEFAULT_TEACHERS) {
      // Check if teacher already exists by email or name
      const exists = existingTeachers.find(
        (t) => t.email === teacher.email || t.name === teacher.name,
      );

      if (!exists) {
        const { id, ...data } = teacher;
        const newTeacher = await addTeacherToDB(data);
        results.teachers++;

        // Check if explicit credentials exist in seed data
        const seedCred = DEFAULT_TEACHER_CREDENTIALS.find(
          (c) => c.teacherId === id,
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
            newTeacher.id,
          );

          await addTeacherCredential({
            teacherId: newTeacher.id,
            username,
            password,
          });
        }
      } else {
        // Teacher exists, ensure they have credentials
        const credExists = existingCredentials.find(
          (c) => c.teacherId === exists.id,
        );

        if (!credExists) {
          const { username, password } = await generateUniqueTeacherCredentials(
            exists.name,
            exists.department,
            exists.id,
          );
          await addTeacherCredential({
            teacherId: exists.id,
            username,
            password,
          });
        }
      }
    }

    // --- Seed Students ---
    const existingStudents = await getStudentsFromDB();
    if (existingStudents.length === 0) {
      for (const student of DEFAULT_STUDENTS) {
        const { id, ...data } = student;
        await addStudentToDB(data);
        results.students++;
      }
    }

    // --- Seed Notices ---
    const existingNotices = await getNoticesFromDB();
    if (existingNotices.length === 0) {
      for (const notice of DEFAULT_NOTICES) {
        const { id, ...data } = notice;
        await addNoticeToDB(data);
        results.notices++;
      }
    }

    // --- Seed Projects ---
    const existingProjects = await getProjectsFromDB();
    if (existingProjects.length === 0) {
      for (const project of DEFAULT_PROJECTS) {
        const { id, ...data } = project;
        await addProjectToDB(data);
        results.projects++;
      }
    }

    return NextResponse.json({
      message: "Database seeded successfully",
      results,
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 },
    );
  }
}
