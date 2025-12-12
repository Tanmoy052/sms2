import type { Student, Teacher, Notice, Project, Admin, TeacherCredentials, Attendance } from "./types"

// Admin credentials (manually configured)
export const ADMIN_CREDENTIALS: Admin[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    name: "System Administrator",
    role: "super-admin",
  },
]

export const TEACHER_CREDENTIALS: TeacherCredentials[] = [
  {
    id: "1",
    teacherId: "1",
    username: "amit.kumar",
    password: "teacher123",
  },
  {
    id: "2",
    teacherId: "2",
    username: "suman.roy",
    password: "teacher123",
  },
]

const initialStudents: Student[] = [
  // CSE Students - different years
  {
    id: "1",
    name: "Rahul Sharma",
    email: "34900122001@cgec.ac.in",
    rollNumber: "34900122001",
    department: "Computer Science & Engineering",
    semester: 6,
    phone: "9876543210",
    address: "Coochbehar, West Bengal",
    dateOfBirth: "2003-05-15",
    admissionYear: 2022,
    guardianName: "Mr. Sharma",
    guardianPhone: "9876543211",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Amit Das",
    email: "34900123015@cgec.ac.in",
    rollNumber: "34900123015",
    department: "Computer Science & Engineering",
    semester: 4,
    phone: "9876543220",
    address: "Alipurduar, West Bengal",
    dateOfBirth: "2004-08-22",
    admissionYear: 2023,
    guardianName: "Mr. Das",
    guardianPhone: "9876543221",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Priya Sen",
    email: "34900124010@cgec.ac.in",
    rollNumber: "34900124010",
    department: "Computer Science & Engineering",
    semester: 2,
    phone: "9876543230",
    address: "Jalpaiguri, West Bengal",
    dateOfBirth: "2005-03-10",
    admissionYear: 2024,
    guardianName: "Mr. Sen",
    guardianPhone: "9876543231",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // ECE Students
  {
    id: "4",
    name: "Sneha Roy",
    email: "34900222005@cgec.ac.in",
    rollNumber: "34900222005",
    department: "Electronics & Communication Engineering",
    semester: 6,
    phone: "9876543240",
    address: "Siliguri, West Bengal",
    dateOfBirth: "2003-06-18",
    admissionYear: 2022,
    guardianName: "Mr. Roy",
    guardianPhone: "9876543241",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Ravi Mondal",
    email: "34900223020@cgec.ac.in",
    rollNumber: "34900223020",
    department: "Electronics & Communication Engineering",
    semester: 4,
    phone: "9876543250",
    address: "Malda, West Bengal",
    dateOfBirth: "2004-09-25",
    admissionYear: 2023,
    guardianName: "Mr. Mondal",
    guardianPhone: "9876543251",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // EE Students
  {
    id: "6",
    name: "Ananya Ghosh",
    email: "34901622008@cgec.ac.in",
    rollNumber: "34901622008",
    department: "Electrical Engineering",
    semester: 6,
    phone: "9876543260",
    address: "Durgapur, West Bengal",
    dateOfBirth: "2003-01-12",
    admissionYear: 2022,
    guardianName: "Mr. Ghosh",
    guardianPhone: "9876543261",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Sourav Banerjee",
    email: "34901624012@cgec.ac.in",
    rollNumber: "34901624012",
    department: "Electrical Engineering",
    semester: 2,
    phone: "9876543270",
    address: "Kolkata, West Bengal",
    dateOfBirth: "2005-04-08",
    admissionYear: 2024,
    guardianName: "Mr. Banerjee",
    guardianPhone: "9876543271",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // ME Students
  {
    id: "8",
    name: "Dipak Sarkar",
    email: "34900423003@cgec.ac.in",
    rollNumber: "34900423003",
    department: "Mechanical Engineering",
    semester: 4,
    phone: "9876543280",
    address: "Asansol, West Bengal",
    dateOfBirth: "2004-07-20",
    admissionYear: 2023,
    guardianName: "Mr. Sarkar",
    guardianPhone: "9876543281",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // CE Students
  {
    id: "9",
    name: "Moumita Dey",
    email: "34900522018@cgec.ac.in",
    rollNumber: "34900522018",
    department: "Civil Engineering",
    semester: 6,
    phone: "9876543290",
    address: "Howrah, West Bengal",
    dateOfBirth: "2003-11-30",
    admissionYear: 2022,
    guardianName: "Mr. Dey",
    guardianPhone: "9876543291",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "10",
    name: "Rajesh Paul",
    email: "34900525007@cgec.ac.in",
    rollNumber: "34900525007",
    department: "Civil Engineering",
    semester: 1,
    phone: "9876543300",
    address: "Murshidabad, West Bengal",
    dateOfBirth: "2006-02-14",
    admissionYear: 2025,
    guardianName: "Mr. Paul",
    guardianPhone: "9876543301",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const initialTeachers: Teacher[] = [
  {
    id: "1",
    name: "Dr. Amit Kumar",
    email: "amit.kumar@cgec.ac.in",
    employeeId: "FAC001",
    department: "Computer Science & Engineering",
    designation: "Associate Professor",
    phone: "9876543100",
    qualification: "Ph.D. in Computer Science",
    specialization: "Machine Learning",
    joiningDate: "2018-07-01",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Prof. Suman Roy",
    email: "suman.roy@cgec.ac.in",
    employeeId: "FAC002",
    department: "Electronics & Communication Engineering",
    designation: "Assistant Professor",
    phone: "9876543101",
    qualification: "M.Tech in VLSI",
    specialization: "Digital Signal Processing",
    joiningDate: "2019-01-15",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const initialNotices: Notice[] = [
  {
    id: "1",
    title: "Mid-Semester Examination Schedule",
    content: "Mid-semester examinations for all departments will commence from March 15, 2024.",
    category: "exam",
    publishedAt: new Date().toISOString(),
    expiresAt: null,
    isActive: true,
  },
]

const initialProjects: Project[] = [
  {
    id: "1",
    title: "Smart Campus Management System",
    description: "An IoT-based system for managing campus resources efficiently.",
    studentIds: ["1"],
    studentNames: ["Rahul Sharma"],
    technologies: ["React", "Node.js", "IoT", "MongoDB"],
    department: "Computer Science & Engineering",
    year: 2024,
    status: "completed",
    githubUrl: "https://github.com/example/smart-campus",
    websiteUrl: "https://smart-campus.example.com",
  },
]

const initialAttendance: Attendance[] = []

// In-memory store for server-side operations
class DataStore {
  private students: Student[] = [...initialStudents]
  private teachers: Teacher[] = [...initialTeachers]
  private notices: Notice[] = [...initialNotices]
  private projects: Project[] = [...initialProjects]
  private attendance: Attendance[] = [...initialAttendance]

  // Students
  getStudents() {
    return [...this.students]
  }

  getStudentById(id: string) {
    return this.students.find((s) => s.id === id)
  }

  getStudentByRollNumber(rollNumber: string) {
    return this.students.find((s) => s.rollNumber === rollNumber)
  }

  getStudentsByDepartment(department: string) {
    return this.students.filter((s) => s.department === department)
  }

  getStudentsByDepartmentAndSemester(department: string, semester: number) {
    return this.students.filter((s) => s.department === department && s.semester === semester)
  }

  addStudent(student: Omit<Student, "id" | "createdAt" | "updatedAt">) {
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.students.push(newStudent)
    return newStudent
  }

  updateStudent(id: string, data: Partial<Student>) {
    const index = this.students.findIndex((s) => s.id === id)
    if (index !== -1) {
      this.students[index] = {
        ...this.students[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return this.students[index]
    }
    return null
  }

  deleteStudent(id: string) {
    const index = this.students.findIndex((s) => s.id === id)
    if (index !== -1) {
      this.students.splice(index, 1)
      return true
    }
    return false
  }

  // Teachers
  getTeachers() {
    return [...this.teachers]
  }

  getTeacherById(id: string) {
    return this.teachers.find((t) => t.id === id)
  }

  getTeachersByDepartment(department: string) {
    return this.teachers.filter((t) => t.department === department)
  }

  addTeacher(teacher: Omit<Teacher, "id" | "createdAt" | "updatedAt">) {
    const newTeacher: Teacher = {
      ...teacher,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.teachers.push(newTeacher)
    return newTeacher
  }

  updateTeacher(id: string, data: Partial<Teacher>) {
    const index = this.teachers.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.teachers[index] = {
        ...this.teachers[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return this.teachers[index]
    }
    return null
  }

  deleteTeacher(id: string) {
    const index = this.teachers.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.teachers.splice(index, 1)
      return true
    }
    return false
  }

  // Notices
  getNotices() {
    return [...this.notices]
  }

  addNotice(notice: Omit<Notice, "id">) {
    const newNotice: Notice = {
      ...notice,
      id: Date.now().toString(),
    }
    this.notices.push(newNotice)
    return newNotice
  }

  updateNotice(id: string, data: Partial<Notice>) {
    const index = this.notices.findIndex((n) => n.id === id)
    if (index !== -1) {
      this.notices[index] = { ...this.notices[index], ...data }
      return this.notices[index]
    }
    return null
  }

  deleteNotice(id: string) {
    const index = this.notices.findIndex((n) => n.id === id)
    if (index !== -1) {
      this.notices.splice(index, 1)
      return true
    }
    return false
  }

  // Projects
  getProjects() {
    return [...this.projects]
  }

  addProject(project: Omit<Project, "id">) {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    }
    this.projects.push(newProject)
    return newProject
  }

  updateProject(id: string, data: Partial<Project>) {
    const index = this.projects.findIndex((p) => p.id === id)
    if (index !== -1) {
      this.projects[index] = { ...this.projects[index], ...data }
      return this.projects[index]
    }
    return null
  }

  deleteProject(id: string) {
    const index = this.projects.findIndex((p) => p.id === id)
    if (index !== -1) {
      this.projects.splice(index, 1)
      return true
    }
    return false
  }

  getAttendance() {
    return [...this.attendance]
  }

  getAttendanceByStudentId(studentId: string) {
    return this.attendance.filter((a) => a.studentId === studentId)
  }

  getAttendanceByDate(date: string) {
    return this.attendance.filter((a) => a.date === date)
  }

  getAttendanceByDeptDateSemester(department: string, date: string, semester?: number) {
    const students = semester
      ? this.getStudentsByDepartmentAndSemester(department, semester)
      : this.getStudentsByDepartment(department)
    const studentIds = students.map((s) => s.id)
    return this.attendance.filter((a) => a.date === date && studentIds.includes(a.studentId))
  }

  addAttendance(attendance: Omit<Attendance, "id" | "createdAt">) {
    const newAttendance: Attendance = {
      ...attendance,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    this.attendance.push(newAttendance)
    return newAttendance
  }

  upsertAttendance(
    studentId: string,
    date: string,
    status: "present" | "absent" | "late",
    subject: string,
    markedBy: string,
  ) {
    const existingIndex = this.attendance.findIndex(
      (a) => a.studentId === studentId && a.date === date && a.subject === subject,
    )

    if (existingIndex !== -1) {
      this.attendance[existingIndex] = {
        ...this.attendance[existingIndex],
        status,
        markedBy,
      }
      return this.attendance[existingIndex]
    } else {
      return this.addAttendance({ studentId, date, status, subject, markedBy })
    }
  }

  updateAttendance(id: string, data: Partial<Attendance>) {
    const index = this.attendance.findIndex((a) => a.id === id)
    if (index !== -1) {
      this.attendance[index] = { ...this.attendance[index], ...data }
      return this.attendance[index]
    }
    return null
  }

  deleteAttendance(id: string) {
    const index = this.attendance.findIndex((a) => a.id === id)
    if (index !== -1) {
      this.attendance.splice(index, 1)
      return true
    }
    return false
  }

  // Stats
  getStats() {
    return {
      totalStudents: this.students.length,
      totalTeachers: this.teachers.length,
      totalNotices: this.notices.filter((n) => n.isActive).length,
      totalProjects: this.projects.length,
      activeStudents: this.students.filter((s) => s.status === "active").length,
      activeTeachers: this.teachers.filter((t) => t.status === "active").length,
      totalAttendanceRecords: this.attendance.length,
    }
  }

  // Sync from external data (for client-to-server sync)
  syncStudents(students: Student[]) {
    this.students = [...students]
  }

  syncTeachers(teachers: Teacher[]) {
    this.teachers = [...teachers]
  }

  // Teacher Credentials
  getTeacherCredentials() {
    return [...TEACHER_CREDENTIALS]
  }

  addTeacherCredential(credential: Omit<TeacherCredentials, "id">) {
    const newCredential: TeacherCredentials = {
      ...credential,
      id: Date.now().toString(),
    }
    TEACHER_CREDENTIALS.push(newCredential)
    return newCredential
  }

  updateTeacherCredential(id: string, data: Partial<TeacherCredentials>) {
    const index = TEACHER_CREDENTIALS.findIndex((c) => c.id === id)
    if (index !== -1) {
      TEACHER_CREDENTIALS[index] = { ...TEACHER_CREDENTIALS[index], ...data }
      return TEACHER_CREDENTIALS[index]
    }
    return null
  }

  deleteTeacherCredential(id: string) {
    const index = TEACHER_CREDENTIALS.findIndex((c) => c.id === id)
    if (index !== -1) {
      TEACHER_CREDENTIALS.splice(index, 1)
      return true
    }
    return false
  }
}

export const dataStore = new DataStore()
