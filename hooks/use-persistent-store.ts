"use client"

import useSWR from "swr"
import { persistentStore } from "@/lib/persistent-store"
import type { Student, Teacher, Notice, Project, Attendance } from "@/lib/types"

// Custom fetcher that uses persistent store
const studentsFetcher = () => persistentStore.getStudents()
const teachersFetcher = () => persistentStore.getTeachers()
const noticesFetcher = () => persistentStore.getNotices()
const projectsFetcher = () => persistentStore.getProjects()
const attendanceFetcher = () => persistentStore.getAttendance()
const statsFetcher = () => persistentStore.getStats()

export function useStudents() {
  const { data, error, isLoading, mutate } = useSWR<Student[]>("students", studentsFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  })

  return {
    students: data || [],
    isLoading,
    isError: error,
    mutate,
    addStudent: async (student: Omit<Student, "id" | "createdAt" | "updatedAt">) => {
      const newStudent = persistentStore.addStudent(student)
      await mutate()
      return newStudent
    },
    updateStudent: async (id: string, data: Partial<Student>) => {
      const updated = persistentStore.updateStudent(id, data)
      await mutate()
      return updated
    },
    deleteStudent: async (id: string) => {
      const result = persistentStore.deleteStudent(id)
      await mutate()
      return result
    },
  }
}

export function useTeachers() {
  const { data, error, isLoading, mutate } = useSWR<Teacher[]>("teachers", teachersFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  })

  return {
    teachers: data || [],
    isLoading,
    isError: error,
    mutate,
    addTeacher: async (teacher: Omit<Teacher, "id" | "createdAt" | "updatedAt">) => {
      const newTeacher = persistentStore.addTeacher(teacher)
      await mutate()
      return newTeacher
    },
    updateTeacher: async (id: string, data: Partial<Teacher>) => {
      const updated = persistentStore.updateTeacher(id, data)
      await mutate()
      return updated
    },
    deleteTeacher: async (id: string) => {
      const result = persistentStore.deleteTeacher(id)
      await mutate()
      return result
    },
  }
}

export function useNotices() {
  const { data, error, isLoading, mutate } = useSWR<Notice[]>("notices", noticesFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  })

  return {
    notices: data || [],
    isLoading,
    isError: error,
    mutate,
    addNotice: async (notice: Omit<Notice, "id">) => {
      const newNotice = persistentStore.addNotice(notice)
      await mutate()
      return newNotice
    },
    updateNotice: async (id: string, data: Partial<Notice>) => {
      const updated = persistentStore.updateNotice(id, data)
      await mutate()
      return updated
    },
    deleteNotice: async (id: string) => {
      const result = persistentStore.deleteNotice(id)
      await mutate()
      return result
    },
  }
}

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>("projects", projectsFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  })

  return {
    projects: data || [],
    isLoading,
    isError: error,
    mutate,
    addProject: async (project: Omit<Project, "id">) => {
      const newProject = persistentStore.addProject(project)
      await mutate()
      return newProject
    },
    updateProject: async (id: string, data: Partial<Project>) => {
      const updated = persistentStore.updateProject(id, data)
      await mutate()
      return updated
    },
    deleteProject: async (id: string) => {
      const result = persistentStore.deleteProject(id)
      await mutate()
      return result
    },
  }
}

export function useAttendance() {
  const { data, error, isLoading, mutate } = useSWR<Attendance[]>("attendance", attendanceFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  })

  return {
    attendance: data || [],
    isLoading,
    isError: error,
    mutate,
    addAttendance: async (attendance: Omit<Attendance, "id" | "createdAt">) => {
      const newAttendance = persistentStore.addAttendance(attendance)
      await mutate()
      return newAttendance
    },
    upsertAttendance: async (
      studentId: string,
      date: string,
      status: "present" | "absent" | "late",
      subject: string,
      markedBy: string,
    ) => {
      const result = persistentStore.upsertAttendance(studentId, date, status, subject, markedBy)
      await mutate()
      return result
    },
    updateAttendance: async (id: string, data: Partial<Attendance>) => {
      const updated = persistentStore.updateAttendance(id, data)
      await mutate()
      return updated
    },
    deleteAttendance: async (id: string) => {
      const result = persistentStore.deleteAttendance(id)
      await mutate()
      return result
    },
  }
}

export function useStats() {
  const { data, error, isLoading, mutate } = useSWR("stats", statsFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  })

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
    mutate,
  }
}

export function useStudentByRollNumber(rollNumber: string) {
  const { data, error, isLoading } = useSWR(
    rollNumber ? `student-${rollNumber}` : null,
    () => persistentStore.getStudentByRollNumber(rollNumber),
    { revalidateOnFocus: false },
  )

  return {
    student: data,
    isLoading,
    isError: error,
  }
}
