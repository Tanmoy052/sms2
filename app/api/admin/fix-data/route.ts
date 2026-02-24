import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DEPT_SHORT_CODES } from "@/lib/types";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // 1. Fetch all teachers and credentials
    const teachers = await db.collection("teachers").find({}).toArray();
    const credentials = await db
      .collection("teacher_credentials")
      .find({})
      .toArray();

    const logs: string[] = [];
    const deletedTeacherIds: string[] = [];

    // 2. Identify and remove duplicates
    // Normalize name: remove title, lowercase, trim
    const normalizeName = (name: string) => {
      return name
        .toLowerCase()
        .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "")
        .trim();
    };

    const teachersByName = new Map<string, any[]>();

    for (const teacher of teachers) {
      const normalized = normalizeName(teacher.name);
      const key = `${normalized}|${teacher.department}`; // Group by name AND department
      if (!teachersByName.has(key)) {
        teachersByName.set(key, []);
      }
      teachersByName.get(key)?.push(teacher);
    }

    for (const [key, group] of teachersByName.entries()) {
      if (group.length > 1) {
        // Keep the one with the most detailed info, or the latest, or the one with Title Case
        // Prefer Title Case over ALL CAPS
        group.sort((a, b) => {
          const aIsCaps = a.name === a.name.toUpperCase();
          const bIsCaps = b.name === b.name.toUpperCase();
          if (aIsCaps && !bIsCaps) return 1; // b comes first
          if (!aIsCaps && bIsCaps) return -1; // a comes first
          return 0;
        });

        const toKeep = group[0];
        const toDelete = group.slice(1);

        logs.push(
          `Keeping ${toKeep.name} (${toKeep._id}), deleting ${toDelete.length} duplicates.`,
        );

        for (const t of toDelete) {
          await db.collection("teachers").deleteOne({ _id: t._id });
          deletedTeacherIds.push(t._id.toString());
          // Also delete their credentials
          await db
            .collection("teacher_credentials")
            .deleteMany({ teacherId: t._id.toString() });
        }
      }
    }

    // 3. Fix usernames for remaining teachers
    const remainingTeachers = await db
      .collection("teachers")
      .find({})
      .toArray();

    // Re-fetch credentials after deletion
    const currentCredentials = await db
      .collection("teacher_credentials")
      .find({})
      .toArray();
    const credentialMap = new Map(); // teacherId -> credential
    currentCredentials.forEach((c) => credentialMap.set(c.teacherId, c));

    const usedUsernames = new Set<string>();

    // First pass: Collect preferred usernames
    const teacherPreferredUsernames = new Map<string, string>(); // teacherId -> preferredUsername

    for (const teacher of remainingTeachers) {
      const cleanName = teacher.name
        .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "")
        .trim();
      const nameParts = cleanName.split(/\s+/).filter(Boolean);
      const firstName = nameParts[0]?.toLowerCase() || "teacher";
      const lastName =
        nameParts.length > 1
          ? nameParts[nameParts.length - 1].toLowerCase()
          : "";
      const baseUsername = lastName ? `${firstName}_${lastName}` : firstName;

      teacherPreferredUsernames.set(teacher._id.toString(), baseUsername);
    }

    // Assign usernames
    // We prioritize keeping existing usernames if they match the pattern,
    // but we want to rename 'tanmoy_pal1' to 'tanmoy_pal' if 'tanmoy_pal' is free.

    // Let's just rebuild credentials for everyone to ensure consistency
    // But we need to be careful not to change passwords if we don't have to.

    // Sort teachers by ID or Name to be deterministic
    remainingTeachers.sort((a, b) => a.name.localeCompare(b.name));

    for (const teacher of remainingTeachers) {
      const teacherId = teacher._id.toString();
      const baseUsername = teacherPreferredUsernames.get(teacherId)!;
      let deptShort = DEPT_SHORT_CODES[teacher.department];
      if (!deptShort) {
        deptShort = teacher.department.split(" ")[0];
      }
      deptShort = deptShort.toLowerCase();
      
      const correctPassword = `${baseUsername.split("_")[0]}@${deptShort}`; // firstname@dept

      let finalUsername = baseUsername;
      let counter = 1;
      while (usedUsernames.has(finalUsername)) {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }

      usedUsernames.add(finalUsername);

      const existingCred = credentialMap.get(teacherId);

      if (existingCred) {
        // Check if we need to update
        const needsUpdate =
          existingCred.username !== finalUsername ||
          existingCred.password !== correctPassword;
        if (needsUpdate) {
          await db
            .collection("teacher_credentials")
            .updateOne(
              { teacherId },
              { $set: { username: finalUsername, password: correctPassword } },
            );
          logs.push(
            `Updated credentials for ${teacher.name}: ${finalUsername} (was ${existingCred.username})`,
          );
        }
      } else {
        // Create missing
        await db.collection("teacher_credentials").insertOne({
          teacherId,
          username: finalUsername,
          password: correctPassword,
          id: new Date().getTime().toString(), // simple ID
        });
        logs.push(`Created credentials for ${teacher.name}: ${finalUsername}`);
      }
    }

    // 4. Remove orphaned credentials (credentials for teachers that don't exist)
    const allTeacherIds = new Set(
      remainingTeachers.map((t) => t._id.toString()),
    );
    const orphans = await db
      .collection("teacher_credentials")
      .find({})
      .toArray();
    for (const cred of orphans) {
      if (!allTeacherIds.has(cred.teacherId)) {
        await db.collection("teacher_credentials").deleteOne({ _id: cred._id });
        logs.push(`Removed orphaned credential: ${cred.username}`);
      }
    }

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Error fixing data:", error);
    return NextResponse.json(
      {
        error: `Failed to fix data: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
