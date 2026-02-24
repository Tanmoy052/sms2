"use client";

import useSWR from "swr";
import type {
  Student,
  Teacher,
  Notice,
  Project,
  Attendance,
} from "@/lib/types";

// Generic fetcher for API calls
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch data");
  return response.json();
};

const studentsFetcher = () => fetcher("/api/students");
const teachersFetcher = () => fetcher("/api/teachers");
const noticesFetcher = () => fetcher("/api/notices");
const projectsFetcher = () => fetcher("/api/projects");
const attendanceFetcher = () => fetcher("/api/attendance");

export function useStudents() {
  const { data, error, isLoading, mutate } = useSWR<Student[]>(
    "students",
    studentsFetcher,
    {
      revalidateOnFocus: true, // Enable revalidation on window focus
      revalidateOnReconnect: true, // Enable revalidation on network reconnect
      dedupingInterval: 2000,
    },
  );

  return {
    students: data || [],
    isLoading,
    isError: error,
    mutate,
    addStudent: async (
      student: Omit<Student, "id" | "createdAt" | "updatedAt">,
    ) => {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      if (!response.ok) throw new Error("Failed to add student");
      const newStudent = await response.json();
      await mutate();
      return newStudent;
    },
    updateStudent: async (id: string, data: Partial<Student>) => {
      const response = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update student");
      const updated = await response.json();
      await mutate();
      return updated;
    },
    deleteStudent: async (id: string) => {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete student");
      await mutate();
      return true;
    },
  };
}

export function useTeachers() {
  const { data, error, isLoading, mutate } = useSWR<Teacher[]>(
    "teachers",
    teachersFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    },
  );

  return {
    teachers: data || [],
    isLoading,
    isError: error,
    mutate,
    addTeacher: async (
      teacher: Omit<Teacher, "id" | "createdAt" | "updatedAt">,
    ) => {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacher),
      });
      if (!response.ok) throw new Error("Failed to add teacher");
      const newTeacher = await response.json();
      await mutate();
      return newTeacher;
    },
    updateTeacher: async (id: string, data: Partial<Teacher>) => {
      const response = await fetch(`/api/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update teacher");
      const updated = await response.json();
      await mutate();
      return updated;
    },
    deleteTeacher: async (id: string) => {
      const response = await fetch(`/api/teachers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete teacher");
      await mutate();
      return true;
    },
  };
}

export function useNotices() {
  const { data, error, isLoading, mutate } = useSWR<Notice[]>(
    "notices",
    noticesFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    },
  );

  return {
    notices: data || [],
    isLoading,
    isError: error,
    mutate,
    addNotice: async (notice: Omit<Notice, "id">) => {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notice),
      });
      if (!response.ok) throw new Error("Failed to add notice");
      const newNotice = await response.json();
      await mutate();
      return newNotice;
    },
    updateNotice: async (id: string, data: Partial<Notice>) => {
      const response = await fetch(`/api/notices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update notice");
      const updated = await response.json();
      await mutate();
      return updated;
    },
    deleteNotice: async (id: string) => {
      const response = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete notice");
      await mutate();
      return true;
    },
  };
}

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>(
    "projects",
    projectsFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    },
  );

  return {
    projects: data || [],
    isLoading,
    isError: error,
    mutate,
    addProject: async (project: Omit<Project, "id">) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      if (!response.ok) throw new Error("Failed to add project");
      const newProject = await response.json();
      await mutate();
      return newProject;
    },
    updateProject: async (id: string, data: Partial<Project>) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update project");
      const updated = await response.json();
      await mutate();
      return updated;
    },
    deleteProject: async (id: string) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");
      await mutate();
      return true;
    },
  };
}

export function useAttendance() {
  const { data, error, isLoading, mutate } = useSWR<Attendance[]>(
    "attendance",
    attendanceFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5000,
      dedupingInterval: 2000,
    },
  );

  return {
    attendance: data || [],
    isLoading,
    isError: error,
    mutate,
    addAttendance: async (attendance: Omit<Attendance, "id" | "createdAt">) => {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendance),
      });
      if (!response.ok) throw new Error("Failed to add attendance");
      const newAttendance = await response.json();
      await mutate();
      return newAttendance;
    },
    upsertAttendance: async (
      studentId: string,
      date: string,
      status: "present" | "absent" | "late",
      subject: string,
      markedBy: string,
    ) => {
      const response = await fetch("/api/attendance/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, date, status, subject, markedBy }),
      });
      if (!response.ok) throw new Error("Failed to upsert attendance");
      const updated = await response.json();
      await mutate();
      return updated;
    },
    updateAttendance: async (id: string, data: Partial<Attendance>) => {
      const response = await fetch(`/api/attendance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update attendance");
      const updated = await response.json();
      await mutate();
      return updated;
    },
    deleteAttendance: async (id: string) => {
      const response = await fetch(`/api/attendance/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete attendance");
      await mutate();
      return true;
    },
  };
}

// Stats fetcher - calculating client side for now to avoid creating another route
export function useStats() {
  const { data, error, isLoading } = useSWR("/api/stats", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 5000,
  });

  return {
    stats: data || {
      totalStudents: 0,
      totalTeachers: 0,
      totalNotices: 0,
      totalProjects: 0,
      activeStudents: 0,
      activeTeachers: 0,
      totalAttendanceRecords: 0,
    },
    isLoading,
    isError: error,
  };
}
