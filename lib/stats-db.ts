import { connectToDatabase } from "@/lib/mongodb";

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalNotices: number;
  totalProjects: number;
  activeStudents: number;
  activeTeachers: number;
  totalAttendanceRecords: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const { db } = await connectToDatabase();

    const [
      totalStudents,
      totalTeachers,
      totalNotices,
      totalProjects,
      activeStudents,
      activeTeachers,
      totalAttendanceRecords,
    ] = await Promise.all([
      db.collection("students").countDocuments(),
      db.collection("teachers").countDocuments(),
      db.collection("notices").countDocuments(),
      db.collection("projects").countDocuments(),
      db.collection("students").countDocuments({ status: "active" }),
      db.collection("teachers").countDocuments({ status: "active" }),
      db.collection("attendance").countDocuments(),
    ]);

    return {
      totalStudents,
      totalTeachers,
      totalNotices,
      totalProjects,
      activeStudents,
      activeTeachers,
      totalAttendanceRecords,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalNotices: 0,
      totalProjects: 0,
      activeStudents: 0,
      activeTeachers: 0,
      totalAttendanceRecords: 0,
    };
  }
}
