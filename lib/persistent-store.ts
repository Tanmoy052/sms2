import type {
  Student,
  Teacher,
  Notice,
  Project,
  Attendance,
  Admin,
  TeacherCredentials,
} from "./types";

// Storage keys
const STORAGE_KEYS = {
  students: "cgec_students",
  teachers: "cgec_teachers",
  notices: "cgec_notices",
  projects: "cgec_projects",
  attendance: "cgec_attendance",
  teacherCredentials: "cgec_teacher_credentials",
  initialized: "cgec_initialized",
} as const;

// Admin credentials (static - configured by system)
export const ADMIN_CREDENTIALS: Admin[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    name: "System Administrator",
    role: "super-admin",
  },
];

// Default teacher credentials
const DEFAULT_TEACHER_CREDENTIALS: TeacherCredentials[] = [
  { id: "1", teacherId: "1", username: "amit.kumar", password: "teacher123" },
  { id: "2", teacherId: "2", username: "suman.roy", password: "teacher123" },
  { id: "3", teacherId: "3", username: "rajesh.singh", password: "teacher123" },
  { id: "4", teacherId: "4", username: "priya.das", password: "teacher123" },
  { id: "5", teacherId: "5", username: "sunil.mondal", password: "teacher123" },
];

// Default data with more students per department
const DEFAULT_STUDENTS: Student[] = [
  // CSE Students - different semesters
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
];

const DEFAULT_TEACHERS: Teacher[] = [
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
  {
    id: "3",
    name: "Dr. Rajesh Singh",
    email: "rajesh.singh@cgec.ac.in",
    employeeId: "FAC003",
    department: "Electrical Engineering",
    designation: "Professor",
    phone: "9876543102",
    qualification: "Ph.D. in Power Systems",
    specialization: "Power Electronics",
    joiningDate: "2015-08-01",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Prof. Priya Das",
    email: "priya.das@cgec.ac.in",
    employeeId: "FAC004",
    department: "Mechanical Engineering",
    designation: "Assistant Professor",
    phone: "9876543103",
    qualification: "M.Tech in Thermal Engineering",
    specialization: "Heat Transfer",
    joiningDate: "2020-01-10",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Dr. Sunil Mondal",
    email: "sunil.mondal@cgec.ac.in",
    employeeId: "FAC005",
    department: "Civil Engineering",
    designation: "Associate Professor",
    phone: "9876543104",
    qualification: "Ph.D. in Structural Engineering",
    specialization: "Concrete Structures",
    joiningDate: "2017-06-15",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_NOTICES: Notice[] = [
  {
    id: "1",
    title: "Mid-Semester Examination Schedule",
    content:
      "Mid-semester examinations for all departments will commence from March 15, 2024.",
    category: "exam",
    publishedAt: new Date().toISOString(),
    expiresAt: null,
    isActive: true,
  },
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Smart Campus Management System",
    description:
      "An IoT-based system for managing campus resources efficiently.",
    studentIds: ["1"],
    studentNames: ["Rahul Sharma"],
    technologies: ["React", "Node.js", "IoT", "MongoDB"],
    department: "Computer Science & Engineering",
    year: 2024,
    status: "completed",
    githubUrl: "https://github.com/example/smart-campus",
    websiteUrl: "https://smart-campus.example.com",
  },
];

let memoryCache: {
  students?: Student[];
  teachers?: Teacher[];
  notices?: Notice[];
  projects?: Project[];
  attendance?: Attendance[];
  teacherCredentials?: TeacherCredentials[];
  lastUpdate: number;
} = { lastUpdate: 0 };

const CACHE_TTL = 1000; // 1 second cache

function invalidateCache() {
  memoryCache = { lastUpdate: 0 };
}

// Helper to safely access localStorage (only on client)
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    invalidateCache();
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

// Initialize storage with default data if not exists
function initializeStorage(): void {
  if (typeof window === "undefined") return;

  const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (!initialized) {
    setToStorage(STORAGE_KEYS.students, DEFAULT_STUDENTS);
    setToStorage(STORAGE_KEYS.teachers, DEFAULT_TEACHERS);
    setToStorage(STORAGE_KEYS.notices, DEFAULT_NOTICES);
    setToStorage(STORAGE_KEYS.projects, DEFAULT_PROJECTS);
    setToStorage(STORAGE_KEYS.attendance, []);
    setToStorage(STORAGE_KEYS.teacherCredentials, DEFAULT_TEACHER_CREDENTIALS);
    localStorage.setItem(STORAGE_KEYS.initialized, "true");
  }
}

function generateUsername(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "")
    .trim()
    .replace(/\s+/g, ".");
}

// Persistent Data Store Class
class PersistentDataStore {
  private isInitialized = false;

  private ensureInitialized() {
    if (!this.isInitialized && typeof window !== "undefined") {
      initializeStorage();
      this.isInitialized = true;
    }
  }

  // Students - Added caching for faster reads
  getStudents(): Student[] {
    this.ensureInitialized();
    const now = Date.now();
    if (memoryCache.students && now - memoryCache.lastUpdate < CACHE_TTL) {
      return memoryCache.students;
    }
    const students = getFromStorage<Student[]>(
      STORAGE_KEYS.students,
      DEFAULT_STUDENTS
    );
    memoryCache.students = students;
    memoryCache.lastUpdate = now;
    return students;
  }

  getStudentById(id: string): Student | undefined {
    return this.getStudents().find((s) => s.id === id);
  }

  getStudentByRollNumber(rollNumber: string): Student | undefined {
    return this.getStudents().find((s) => s.rollNumber === rollNumber);
  }

  getStudentsByDepartment(department: string): Student[] {
    return this.getStudents().filter(
      (s) => s.department === department && s.status === "active"
    );
  }

  getStudentsByDepartmentAndSemester(
    department: string,
    semester: number
  ): Student[] {
    return this.getStudents().filter(
      (s) =>
        s.department === department &&
        s.semester === semester &&
        s.status === "active"
    );
  }

  addStudent(
    student: Omit<Student, "id" | "createdAt" | "updatedAt">
  ): Student {
    const students = this.getStudents();
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    students.push(newStudent);
    setToStorage(STORAGE_KEYS.students, students);
    return newStudent;
  }

  updateStudent(id: string, data: Partial<Student>): Student | null {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.id === id);
    if (index !== -1) {
      students[index] = {
        ...students[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      setToStorage(STORAGE_KEYS.students, students);
      return students[index];
    }
    return null;
  }

  deleteStudent(id: string): boolean {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.id === id);
    if (index !== -1) {
      students.splice(index, 1);
      setToStorage(STORAGE_KEYS.students, students);
      return true;
    }
    return false;
  }

  // Teachers - Added caching
  getTeachers(): Teacher[] {
    this.ensureInitialized();
    const now = Date.now();
    if (memoryCache.teachers && now - memoryCache.lastUpdate < CACHE_TTL) {
      return memoryCache.teachers;
    }
    const teachers = getFromStorage<Teacher[]>(
      STORAGE_KEYS.teachers,
      DEFAULT_TEACHERS
    );
    memoryCache.teachers = teachers;
    memoryCache.lastUpdate = now;
    return teachers;
  }

  getTeacherById(id: string): Teacher | undefined {
    return this.getTeachers().find((t) => t.id === id);
  }

  getTeachersByDepartment(department: string): Teacher[] {
    return this.getTeachers().filter(
      (t) => t.department === department && t.status === "active"
    );
  }

  addTeacher(
    teacher: Omit<Teacher, "id" | "createdAt" | "updatedAt">
  ): Teacher {
    const teachers = this.getTeachers();
    const newTeacher: Teacher = {
      ...teacher,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    teachers.push(newTeacher);
    setToStorage(STORAGE_KEYS.teachers, teachers);

    // Auto-create credential for new teacher
    const username = generateUsername(newTeacher.name);
    this.addTeacherCredential({
      teacherId: newTeacher.id,
      username,
      password: "teacher123",
    });

    return newTeacher;
  }

  updateTeacher(id: string, data: Partial<Teacher>): Teacher | null {
    const teachers = this.getTeachers();
    const index = teachers.findIndex((t) => t.id === id);
    if (index !== -1) {
      teachers[index] = {
        ...teachers[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      setToStorage(STORAGE_KEYS.teachers, teachers);
      return teachers[index];
    }
    return null;
  }

  deleteTeacher(id: string): boolean {
    const teachers = this.getTeachers();
    const index = teachers.findIndex((t) => t.id === id);
    if (index !== -1) {
      teachers.splice(index, 1);
      setToStorage(STORAGE_KEYS.teachers, teachers);
      // Also delete credential
      const creds = this.getTeacherCredentials();
      const credIndex = creds.findIndex((c) => c.teacherId === id);
      if (credIndex !== -1) {
        creds.splice(credIndex, 1);
        setToStorage(STORAGE_KEYS.teacherCredentials, creds);
      }
      return true;
    }
    return false;
  }

  // Teacher Credentials
  getTeacherCredentials(): TeacherCredentials[] {
    this.ensureInitialized();
    const now = Date.now();
    if (
      memoryCache.teacherCredentials &&
      now - memoryCache.lastUpdate < CACHE_TTL
    ) {
      return memoryCache.teacherCredentials;
    }
    const creds = getFromStorage<TeacherCredentials[]>(
      STORAGE_KEYS.teacherCredentials,
      DEFAULT_TEACHER_CREDENTIALS
    );
    memoryCache.teacherCredentials = creds;
    return creds;
  }

  getTeacherCredentialByUsername(
    username: string
  ): TeacherCredentials | undefined {
    return this.getTeacherCredentials().find((c) => c.username === username);
  }

  addTeacherCredential(
    cred: Omit<TeacherCredentials, "id">
  ): TeacherCredentials {
    const creds = this.getTeacherCredentials();
    // Check if credential already exists for this teacher
    const existing = creds.find((c) => c.teacherId === cred.teacherId);
    if (existing) return existing;

    const newCred: TeacherCredentials = {
      ...cred,
      id: Date.now().toString(),
    };
    creds.push(newCred);
    setToStorage(STORAGE_KEYS.teacherCredentials, creds);
    return newCred;
  }

  // Notices
  getNotices(): Notice[] {
    this.ensureInitialized();
    return getFromStorage<Notice[]>(STORAGE_KEYS.notices, DEFAULT_NOTICES);
  }

  addNotice(notice: Omit<Notice, "id">): Notice {
    const notices = this.getNotices();
    const newNotice: Notice = {
      ...notice,
      id: Date.now().toString(),
    };
    notices.push(newNotice);
    setToStorage(STORAGE_KEYS.notices, notices);
    return newNotice;
  }

  updateNotice(id: string, data: Partial<Notice>): Notice | null {
    const notices = this.getNotices();
    const index = notices.findIndex((n) => n.id === id);
    if (index !== -1) {
      notices[index] = { ...notices[index], ...data };
      setToStorage(STORAGE_KEYS.notices, notices);
      return notices[index];
    }
    return null;
  }

  deleteNotice(id: string): boolean {
    const notices = this.getNotices();
    const index = notices.findIndex((n) => n.id === id);
    if (index !== -1) {
      notices.splice(index, 1);
      setToStorage(STORAGE_KEYS.notices, notices);
      return true;
    }
    return false;
  }

  // Projects
  getProjects(): Project[] {
    this.ensureInitialized();
    return getFromStorage<Project[]>(STORAGE_KEYS.projects, DEFAULT_PROJECTS);
  }

  addProject(project: Omit<Project, "id">): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    };
    projects.push(newProject);
    setToStorage(STORAGE_KEYS.projects, projects);
    return newProject;
  }

  updateProject(id: string, data: Partial<Project>): Project | null {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...data };
      setToStorage(STORAGE_KEYS.projects, projects);
      return projects[index];
    }
    return null;
  }

  deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index !== -1) {
      projects.splice(index, 1);
      setToStorage(STORAGE_KEYS.projects, projects);
      return true;
    }
    return false;
  }

  // Attendance
  getAttendance(): Attendance[] {
    this.ensureInitialized();
    return getFromStorage<Attendance[]>(STORAGE_KEYS.attendance, []);
  }

  getAttendanceByStudentId(studentId: string): Attendance[] {
    return this.getAttendance().filter((a) => a.studentId === studentId);
  }

  getAttendanceByDate(date: string): Attendance[] {
    return this.getAttendance().filter((a) => a.date === date);
  }

  getAttendanceByDeptDateSemester(
    department: string,
    date: string,
    semester?: number
  ): Attendance[] {
    const students = semester
      ? this.getStudentsByDepartmentAndSemester(department, semester)
      : this.getStudentsByDepartment(department);
    const studentIds = students.map((s) => s.id);
    return this.getAttendance().filter(
      (a) => a.date === date && studentIds.includes(a.studentId)
    );
  }

  addAttendance(
    attendance: Omit<Attendance, "id" | "createdAt" | "updatedAt">
  ): Attendance {
    const attendanceList = this.getAttendance();
    const newAttendance: Attendance = {
      ...attendance,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    attendanceList.push(newAttendance);
    setToStorage(STORAGE_KEYS.attendance, attendanceList);
    return newAttendance;
  }

  upsertAttendance(
    studentId: string,
    date: string,
    status: "present" | "absent" | "late",
    subject: string,
    markedBy: string
  ): Attendance {
    const attendanceList = this.getAttendance();
    const existingIndex = attendanceList.findIndex(
      (a) =>
        a.studentId === studentId && a.date === date && a.subject === subject
    );

    if (existingIndex !== -1) {
      attendanceList[existingIndex] = {
        ...attendanceList[existingIndex],
        status,
        markedBy,
      };
      setToStorage(STORAGE_KEYS.attendance, attendanceList);
      return attendanceList[existingIndex];
    } else {
      return this.addAttendance({ studentId, date, status, subject, markedBy });
    }
  }

  updateAttendance(id: string, data: Partial<Attendance>): Attendance | null {
    const attendanceList = this.getAttendance();
    const index = attendanceList.findIndex((a) => a.id === id);
    if (index !== -1) {
      attendanceList[index] = { ...attendanceList[index], ...data };
      setToStorage(STORAGE_KEYS.attendance, attendanceList);
      return attendanceList[index];
    }
    return null;
  }

  deleteAttendance(id: string): boolean {
    const attendanceList = this.getAttendance();
    const index = attendanceList.findIndex((a) => a.id === id);
    if (index !== -1) {
      attendanceList.splice(index, 1);
      setToStorage(STORAGE_KEYS.attendance, attendanceList);
      return true;
    }
    return false;
  }

  // Stats
  getStats() {
    const students = this.getStudents();
    const teachers = this.getTeachers();
    const notices = this.getNotices();
    const projects = this.getProjects();
    const attendance = this.getAttendance();

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalNotices: notices.filter((n) => n.isActive).length,
      totalProjects: projects.length,
      activeStudents: students.filter((s) => s.status === "active").length,
      activeTeachers: teachers.filter((t) => t.status === "active").length,
      totalAttendanceRecords: attendance.length,
    };
  }

  // Reset data (for testing)
  resetToDefaults(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.initialized);
    invalidateCache();
    initializeStorage();
  }
}

export const persistentStore = new PersistentDataStore();
