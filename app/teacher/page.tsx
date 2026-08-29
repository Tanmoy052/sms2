"use client";

import type React from "react";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  useStudents,
  useNotices,
  useProjects,
  useAttendance,
} from "@/hooks/use-api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  BookOpen,
  ClipboardList,
  FolderKanban,
  Bell,
  Plus,
  Edit,
  Trash2,
  Github,
  Globe,
  Save,
  Download,
  FileText,
  Filter,
  History,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Search,
  Users,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import {
  DEPARTMENTS,
  DEPT_SHORT_CODES,
  type Teacher,
  type Student,
  type Attendance,
  type Notice,
  type Project,
  type TeacherCredentials,
} from "@/lib/types";
import {
  generateAttendancePDF,
  generateDateWiseAttendancePDF,
} from "@/lib/pdf-generator";
import { SUBJECTS_BY_DEPARTMENT } from "@/lib/subjects";
import { Combobox } from "@/components/ui/combobox";
import { mutate } from "swr";
import { formatDate } from "@/lib/utils";
import { UpdateTeacherCredentials } from "@/components/teacher/update-credentials";

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherCreds, setTeacherCreds] = useState<TeacherCredentials | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { students } = useStudents();
  const { notices } = useNotices();
  const { projects } = useProjects();
  const { attendance } = useAttendance();

  const fetchCreds = useCallback(async (userId: string) => {
    try {
      const credsRes = await fetch(
        `/api/teachers/credentials?teacherId=${userId}`,
      );
      if (credsRes.ok) {
        const credsData = await credsRes.json();
        setTeacherCreds(credsData);
      }
    } catch (err) {
      console.error("Error fetching teacher credentials:", err);
    }
  }, []);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        if (!session || session.role !== "teacher") {
          router.push("/login?type=teacher");
          return;
        }
        setTeacher(session.user as Teacher);

        // Fetch credentials for the update section
        await fetchCreds(session.userId);
      } catch {
        router.push("/login?type=teacher");
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, [router, fetchCreds]);

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!teacher) return;

    const formData = new FormData(e.currentTarget);
    const photoInput = document.getElementById(
      "teacher-profile-photo-value",
    ) as HTMLInputElement;

    const data = {
      phone: formData.get("phone"),
      qualification: formData.get("qualification"),
      specialization: formData.get("specialization"),
      photo: photoInput?.value || teacher.photo,
    };

    const res = await fetch(`/api/teachers/${teacher.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const updatedTeacher = await res.json();
      setTeacher(updatedTeacher);
      setIsEditOpen(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!teacher) return null;

  const activeNotices = notices.filter((n) => n.isActive);
  const deptStudents = students.filter(
    (s) => s.department === teacher.department,
  );
  const deptProjects = projects.filter(
    (p) => p.department === teacher.department,
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-6jybyzr1r5WRLGCSQ4h5arS8GijNfgo7GA&s"
              alt="CGEC Logo"
              width={32}
              height={32}
              className="rounded-full"
              priority
            />
            <span className="font-semibold text-sm">Teacher Portal</span>
            <Badge variant="outline" className="ml-2 text-xs bg-muted">
              {teacher.department.split(" ")[0]}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {teacher.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/api/auth/logout")}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">
            Welcome, {teacher.name}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {teacher.department}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 h-auto flex-wrap justify-start gap-2">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="notices" className="gap-2">
              <Bell className="h-4 w-4" />
              Notices
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Shield className="h-4 w-4" />
              Update User
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab
              teacher={teacher}
              isEditOpen={isEditOpen}
              setIsEditOpen={setIsEditOpen}
              onUpdateProfile={handleUpdateProfile}
            />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceTab
              students={students}
              teacherId={teacher.id}
              attendance={attendance || []}
              department={teacher.department}
            />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsTab
              projects={deptProjects}
              department={teacher.department}
            />
          </TabsContent>

          <TabsContent value="notices">
            <NoticesTab notices={activeNotices} teacherId={teacher.id} />
          </TabsContent>

          <TabsContent value="settings">
            <UpdateTeacherCredentials
              currentCreds={teacherCreds}
              onSuccess={() => fetchCreds(teacher.id)}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ProfileTab({
  teacher,
  isEditOpen,
  setIsEditOpen,
  onUpdateProfile,
}: {
  teacher: Teacher;
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  onUpdateProfile: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [photo, setPhoto] = useState(teacher.photo || "");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            My Profile
          </CardTitle>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <form onSubmit={onUpdateProfile} className="space-y-4">
                <div className="flex justify-center">
                  <div className="text-center">
                    <Label className="mb-2 block">Profile Photo</Label>
                    <FileUpload
                      value={photo}
                      onChange={setPhoto}
                      placeholder="Change Photo"
                    />
                    <input
                      type="hidden"
                      id="teacher-profile-photo-value"
                      value={photo}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" defaultValue={teacher.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    name="qualification"
                    defaultValue={teacher.qualification}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    defaultValue={teacher.specialization}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Save Changes
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {teacher.photo ? (
              <Image
                src={teacher.photo || "/placeholder.svg"}
                alt={teacher.name}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{teacher.name}</h3>
            <p className="text-muted-foreground">{teacher.designation}</p>
            <Badge
              variant={teacher.status === "active" ? "default" : "secondary"}
              className="mt-1"
            >
              {teacher.status}
            </Badge>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{teacher.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{teacher.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{teacher.department}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span>{teacher.qualification}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>{teacher.specialization}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Joined: {teacher.joiningDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AttendanceTab({
  students,
  teacherId,
  attendance,
  department,
}: {
  students: Student[];
  teacherId: string;
  attendance: Attendance[];
  department: string;
}) {
  const { upsertAttendance } = useAttendance();
  const [activeSubTab, setActiveSubTab] = useState<"mark" | "history">("mark");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [subject, setSubject] = useState("");

  // Default to teacher's department, or "all" if BSH/unspecified
  const [selectedDepartment, setSelectedDepartment] = useState<string>(() => {
    if (department === "Basic Science & Humanities") return "all";
    return department || "all";
  });
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [studentSearch, setStudentSearch] = useState<string>("");

  const [attendanceData, setAttendanceData] = useState<
    Record<string, "present" | "absent" | null>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  // History filters
  const [historySubject, setHistorySubject] = useState<string>("all");
  const [historyStartDate, setHistoryStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [historyEndDate, setHistoryEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Department options
  const departmentOptions = useMemo(() => {
    const baseDepts = [
      { name: "Computer Science & Engineering", code: "CSE" },
      { name: "Electronics & Communication Engineering", code: "ECE" },
      { name: "Electrical Engineering", code: "EE" },
      { name: "Mechanical Engineering", code: "ME" },
      { name: "Civil Engineering", code: "CE" },
    ];
    return baseDepts;
  }, []);

  // Filter students based on department, semester, and search query
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesDept =
          selectedDepartment === "all" ||
          s.department.trim().toLowerCase() === selectedDepartment.trim().toLowerCase();

        const matchesSem =
          selectedSemester === "all" ||
          s.semester.toString() === selectedSemester;

        const matchesSearch =
          !studentSearch.trim() ||
          s.name.toLowerCase().includes(studentSearch.toLowerCase().trim()) ||
          s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase().trim());

        return matchesDept && matchesSem && matchesSearch;
      })
      .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
  }, [students, selectedDepartment, selectedSemester, studentSearch]);

  // Calculate student counts per semester for the chosen department
  const getSemesterCount = useCallback(
    (sem: string) => {
      return students.filter((s) => {
        const matchesDept =
          selectedDepartment === "all" ||
          s.department.trim().toLowerCase() === selectedDepartment.trim().toLowerCase();
        const matchesSem =
          sem === "all" || s.semester.toString() === sem;
        return matchesDept && matchesSem;
      }).length;
    },
    [students, selectedDepartment],
  );

  // Calculate count per department
  const getDepartmentCount = useCallback(
    (deptName: string) => {
      if (deptName === "all") return students.length;
      return students.filter(
        (s) => s.department.trim().toLowerCase() === deptName.trim().toLowerCase(),
      ).length;
    },
    [students],
  );

  // Unique subjects from attendance records
  const uniqueSubjects = useMemo(() => {
    const subjects = [...new Set(attendance.map((a) => a.subject))];
    return subjects.sort();
  }, [attendance]);

  // Dynamic subjects based on chosen department
  const activeDeptForSubjects =
    selectedDepartment === "all" ? department : selectedDepartment;
  const departmentSubjects =
    SUBJECTS_BY_DEPARTMENT[activeDeptForSubjects] ||
    SUBJECTS_BY_DEPARTMENT[department] ||
    [];

  const deptCustomSubjects = uniqueSubjects.filter((subj) => {
    return attendance.some(
      (a) =>
        a.subject === subj &&
        students.some(
          (s) =>
            s.id === a.studentId &&
            (selectedDepartment === "all" ||
              s.department.trim().toLowerCase() ===
                selectedDepartment.trim().toLowerCase()),
        ),
    );
  });

  const allSubjects = [
    ...departmentSubjects,
    ...deptCustomSubjects.filter((s) => !departmentSubjects.includes(s)),
  ].sort();

  // Filter attendance for history view
  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      const matchesSubject =
        historySubject === "all" || a.subject === historySubject;
      const matchesDate =
        a.date >= historyStartDate && a.date <= historyEndDate;
      const matchingStudent = students.find((s) => s.id === a.studentId);
      if (!matchingStudent) return false;

      const matchesDept =
        selectedDepartment === "all" ||
        matchingStudent.department.trim().toLowerCase() ===
          selectedDepartment.trim().toLowerCase();

      const matchesSem =
        selectedSemester === "all" ||
        matchingStudent.semester.toString() === selectedSemester;

      return matchesSubject && matchesDate && matchesDept && matchesSem;
    });
  }, [
    attendance,
    historySubject,
    historyStartDate,
    historyEndDate,
    students,
    selectedDepartment,
    selectedSemester,
  ]);

  // Group attendance by date and subject for history view
  const groupedAttendance = useMemo(() => {
    const grouped: Record<string, Record<string, Attendance[]>> = {};
    filteredAttendance.forEach((a) => {
      if (!grouped[a.date]) grouped[a.date] = {};
      if (!grouped[a.date][a.subject]) grouped[a.date][a.subject] = [];
      grouped[a.date][a.subject].push(a);
    });
    return grouped;
  }, [filteredAttendance]);

  // Reset or initialize attendance data map when filtered list changes
  useEffect(() => {
    const initialData: Record<string, "present" | "absent" | null> = {};
    filteredStudents.forEach((s) => {
      initialData[s.id] = null;
    });
    setAttendanceData(initialData);
  }, [filteredStudents]);

  async function handleSaveAttendance() {
    if (!subject) {
      alert("Please select or type a subject");
      return;
    }

    if (filteredStudents.length === 0) {
      alert("No students available to mark attendance");
      return;
    }

    const unset = Object.values(attendanceData).filter(
      (v) => v === null,
    ).length;
    if (unset > 0) {
      alert("Please set Present or Absent for all students");
      return;
    }

    setIsSaving(true);
    try {
      for (const [studentId, status] of Object.entries(attendanceData)) {
        await upsertAttendance(
          studentId,
          selectedDate,
          status as "present" | "absent",
          subject,
          teacherId,
        );
      }
      alert("Attendance saved successfully!");
    } catch {
      alert("Error saving attendance");
    } finally {
      setIsSaving(false);
    }
  }

  function markAll(status: "present" | "absent") {
    const newData: Record<string, "present" | "absent" | null> = {};
    filteredStudents.forEach((s) => {
      newData[s.id] = status;
    });
    setAttendanceData(newData);
  }

  // Download subject-wise PDF report
  function handleDownloadSubjectReport() {
    if (historySubject === "all") {
      alert("Please select a specific subject to download report");
      return;
    }

    const subjectAttendance = filteredAttendance.filter(
      (a) => a.subject === historySubject,
    );
    const relevantStudentIds = [
      ...new Set(subjectAttendance.map((a) => a.studentId)),
    ];
    const relevantStudents = students.filter((s) =>
      relevantStudentIds.includes(s.id),
    );

    generateAttendancePDF({
      subject: historySubject,
      department: selectedDepartment === "all" ? department : selectedDepartment,
      startDate: historyStartDate,
      endDate: historyEndDate,
      students:
        relevantStudents.length > 0 ? relevantStudents : filteredStudents,
      attendance: subjectAttendance,
    });
  }

  // Download date-wise PDF report
  function handleDownloadDateReport(date: string, subj: string) {
    const dateAttendance = attendance.filter(
      (a) => a.date === date && a.subject === subj,
    );
    const relevantStudentIds = [
      ...new Set(dateAttendance.map((a) => a.studentId)),
    ];
    const relevantStudents = students.filter((s) =>
      relevantStudentIds.includes(s.id),
    );

    generateDateWiseAttendancePDF({
      date,
      subject: subj,
      department: selectedDepartment === "all" ? department : selectedDepartment,
      students: relevantStudents,
      attendance: dateAttendance,
    });
  }

  return (
    <div className="space-y-6">
      {/* Sub-tabs for Mark vs History */}
      <Tabs
        value={activeSubTab}
        onValueChange={(v) => setActiveSubTab(v as "mark" | "history")}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="mark" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Attendance History
          </TabsTrigger>
        </TabsList>

        {/* Mark Attendance Tab */}
        <TabsContent value="mark" className="mt-4">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Mark Attendance
                  </CardTitle>
                  <CardDescription>
                    Select department, semester, subject, and record student attendance
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1 font-medium text-xs bg-primary/5 text-primary border-primary/20">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    {filteredStudents.length} Students Active
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Department & Search Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border/40">
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      Department
                    </Label>
                    {department && selectedDepartment !== department && (
                      <button
                        type="button"
                        onClick={() => setSelectedDepartment(department)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Reset to My Dept ({DEPT_SHORT_CODES[department] || "My"})
                      </button>
                    )}
                  </div>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger className="w-full bg-background font-medium">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        🌐 All Departments ({getDepartmentCount("all")} students)
                      </SelectItem>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept.name} value={dept.name}>
                          {dept.name} ({dept.code}) — {getDepartmentCount(dept.name)} students
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-primary" />
                    Search Student
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Name or Roll Number..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="bg-background pr-8"
                    />
                    {studentSearch && (
                      <button
                        onClick={() => setStudentSearch("")}
                        className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Semester Selector Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                    Select Semester
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Filtered: {filteredStudents.length} students
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-1.5 bg-muted/50 rounded-lg border border-border/40">
                  <Button
                    type="button"
                    variant={selectedSemester === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedSemester("all")}
                    className="h-8 text-xs font-medium gap-1.5"
                  >
                    All Semesters
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedSemester === "all" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/15 text-muted-foreground"
                    }`}>
                      {getSemesterCount("all")}
                    </span>
                  </Button>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                    const count = getSemesterCount(sem.toString());
                    const isSelected = selectedSemester === sem.toString();
                    return (
                      <Button
                        key={sem}
                        type="button"
                        variant={isSelected ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedSemester(sem.toString())}
                        className="h-8 text-xs font-medium gap-1.5"
                      >
                        Sem {sem}
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected ? "bg-primary-foreground/20 text-primary-foreground" : count > 0 ? "bg-primary/15 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
                        }`}>
                          {count}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Subject Controls */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Date
                  </Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    Subject
                  </Label>
                  <Combobox
                    items={allSubjects}
                    value={subject}
                    onChange={setSubject}
                    placeholder="Select or type subject"
                    allowCustom={true}
                    emptyText="No matching subject found"
                  />
                </div>
              </div>

              {/* Quick Actions Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => markAll("present")}
                    disabled={filteredStudents.length === 0}
                    className="gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Present All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => markAll("absent")}
                    disabled={filteredStudents.length === 0}
                    className="gap-1.5 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-300 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Absent All
                  </Button>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">
                    Marked:{" "}
                    <strong className="text-foreground">
                      {Object.values(attendanceData).filter((v) => v !== null).length}
                    </strong>{" "}
                    / {filteredStudents.length}
                  </span>
                  {Object.values(attendanceData).some((v) => v === null) && filteredStudents.length > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      (Pending entries)
                    </span>
                  )}
                </div>
              </div>

              {/* Student Cards List */}
              <div className="bg-background rounded-xl border border-border/60 divide-y divide-border/40 max-h-[420px] overflow-y-auto shadow-inner">
                {filteredStudents.map((student, index) => {
                  const currentStatus = attendanceData[student.id];
                  const deptShort =
                    DEPT_SHORT_CODES[student.department] ||
                    student.department.split(" ")[0];

                  return (
                    <div
                      key={student.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 hover:bg-muted/40 transition-colors gap-3 ${
                        currentStatus === "present"
                          ? "bg-emerald-500/5"
                          : currentStatus === "absent"
                          ? "bg-rose-500/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="text-xs font-mono text-muted-foreground w-6 flex-shrink-0 text-center font-semibold">
                          {index + 1}.
                        </span>
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-primary/20">
                          {student.photo ? (
                            <Image
                              src={student.photo || "/placeholder.svg"}
                              alt={student.name}
                              width={36}
                              height={36}
                              className="object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate max-w-[200px] sm:max-w-none">
                            {student.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <span className="font-mono bg-muted px-1.5 py-0.2 rounded text-[11px] font-medium text-foreground">
                              {student.rollNumber}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1 py-0 border-border">
                              {deptShort}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">
                              Sem {student.semester}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                        <Button
                          type="button"
                          variant={currentStatus === "present" ? "default" : "outline"}
                          size="sm"
                          className={`h-8 gap-1 text-xs font-medium flex-shrink-0 ${
                            currentStatus === "present"
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "hover:border-emerald-400 hover:text-emerald-700"
                          }`}
                          onClick={() =>
                            setAttendanceData((prev) => ({
                              ...prev,
                              [student.id]: "present",
                            }))
                          }
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Present
                        </Button>
                        <Button
                          type="button"
                          variant={currentStatus === "absent" ? "default" : "outline"}
                          size="sm"
                          className={`h-8 gap-1 text-xs font-medium flex-shrink-0 ${
                            currentStatus === "absent"
                              ? "bg-rose-600 hover:bg-rose-700 text-white"
                              : "hover:border-rose-400 hover:text-rose-700"
                          }`}
                          onClick={() =>
                            setAttendanceData((prev) => ({
                              ...prev,
                              [student.id]: "absent",
                            }))
                          }
                        >
                          <XCircle className="h-3.5 w-3.5" /> Absent
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <div className="text-center py-12 px-4 space-y-2">
                    <p className="font-medium text-sm text-foreground">
                      No students found
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      No students match department{" "}
                      <strong>
                        {selectedDepartment === "all" ? "All Departments" : selectedDepartment}
                      </strong>{" "}
                      and{" "}
                      <strong>
                        {selectedSemester === "all" ? "All Semesters" : `Semester ${selectedSemester}`}
                      </strong>
                      . Try selecting a different semester or department above.
                    </p>
                  </div>
                )}
              </div>

              {/* Save Attendance Button */}
              <Button
                onClick={handleSaveAttendance}
                className="w-full gap-2 font-medium shadow-sm py-5 text-sm"
                disabled={
                  isSaving ||
                  filteredStudents.length === 0 ||
                  Object.values(attendanceData).some((v) => v === null)
                }
              >
                <Save className="h-4 w-4" />
                {isSaving
                  ? "Saving attendance records..."
                  : `Save Attendance for ${filteredStudents.length} Students`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance History Tab */}
        <TabsContent value="history" className="mt-4 space-y-4">
          {/* Filters Card */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                Filter Attendance Records
              </CardTitle>
              <CardDescription>
                Filter records by department, semester, subject, and date range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger className="bg-background text-xs">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept.name} value={dept.name}>
                          {dept.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Semester</Label>
                  <Select
                    value={selectedSemester}
                    onValueChange={setSelectedSemester}
                  >
                    <SelectTrigger className="bg-background text-xs">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Subject</Label>
                  <Combobox
                    items={allSubjects}
                    value={historySubject === "all" ? "" : historySubject}
                    onChange={(val) => setHistorySubject(val || "all")}
                    placeholder="All Subjects"
                    allowCustom={false}
                    emptyText="No records found"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Start Date</Label>
                  <Input
                    type="date"
                    value={historyStartDate}
                    onChange={(e) => setHistoryStartDate(e.target.value)}
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">End Date</Label>
                  <Input
                    type="date"
                    value={historyEndDate}
                    onChange={(e) => setHistoryEndDate(e.target.value)}
                    className="bg-background text-xs"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex justify-end">
                <Button
                  onClick={handleDownloadSubjectReport}
                  size="sm"
                  className="gap-2 text-xs"
                  disabled={historySubject === "all"}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Subject PDF ({historySubject === "all" ? "Select Subject First" : historySubject})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subject-wise Summary */}
          {historySubject !== "all" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Subject Summary: {historySubject}
                </CardTitle>
                <CardDescription>
                  {formatDate(historyStartDate)} to {formatDate(historyEndDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {filteredStudents.map((student) => {
                    const studentAttendance = filteredAttendance.filter(
                      (a) =>
                        a.studentId === student.id &&
                        a.subject === historySubject,
                    );
                    const presentCount = studentAttendance.filter(
                      (a) => a.status === "present",
                    ).length;
                    const total = studentAttendance.length;
                    const percent =
                      total > 0 ? Math.round((presentCount / total) * 100) : 0;

                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 border border-border/40 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                            {student.photo ? (
                              <Image
                                src={student.photo || "/placeholder.svg"}
                                alt={student.name}
                                width={36}
                                height={36}
                                className="object-cover"
                              />
                            ) : (
                              <User className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span className="font-mono font-medium">
                                {student.rollNumber}
                              </span>
                              <span>•</span>
                              <span>Sem {student.semester}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-sm ${
                              percent >= 75
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {percent}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {presentCount} / {total} classes
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <p className="text-center py-6 text-xs text-muted-foreground">
                      No students found for this subject and filter criteria.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date-wise Records */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Date-wise Attendance Records
              </CardTitle>
              <CardDescription>
                {Object.keys(groupedAttendance).length} recorded days found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {Object.entries(groupedAttendance)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, subjects]) => (
                    <div
                      key={date}
                      className="border border-border/40 rounded-xl p-3.5 bg-background shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>{formatDate(date)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(subjects).map(([subj, records]) => {
                          const presentCount = records.filter(
                            (r) => r.status === "present",
                          ).length;
                          const absentCount = records.filter(
                            (r) => r.status === "absent",
                          ).length;
                          return (
                            <div
                              key={subj}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 bg-muted/40 rounded-lg gap-2 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                <span className="font-medium text-foreground">
                                  {subj}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                                <Badge
                                  variant="outline"
                                  className="text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/30 text-[11px]"
                                >
                                  {presentCount} Present
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-rose-700 bg-rose-50 border-rose-300 dark:text-rose-400 dark:bg-rose-950/30 text-[11px]"
                                >
                                  {absentCount} Absent
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDownloadDateReport(date, subj)
                                  }
                                  className="gap-1 h-7 text-xs ml-auto sm:ml-0"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  PDF
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                {Object.keys(groupedAttendance).length === 0 && (
                  <p className="text-center py-8 text-xs text-muted-foreground">
                    No attendance records found for the selected filters
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectsTab({
  projects,
  department,
}: {
  projects: Project[];
  department: string;
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const {
    addProject,
    updateProject,
    deleteProject,
    mutate: refreshProjects,
  } = useProjects();

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      department,
      year: Number.parseInt(formData.get("year") as string),
      status: formData.get("status"),
      technologies: (formData.get("technologies") as string)
        .split(",")
        .map((t) => t.trim()),
      studentNames: (formData.get("studentNames") as string)
        .split(",")
        .map((t) => t.trim()),
      githubUrl: formData.get("githubUrl") || undefined,
      websiteUrl: formData.get("websiteUrl") || undefined,
      studentIds: [],
    };

    await addProject(data as any);
    await refreshProjects();
    setIsAddOpen(false);
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editProject) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      department,
      year: Number.parseInt(formData.get("year") as string),
      status: formData.get("status"),
      technologies: (formData.get("technologies") as string)
        .split(",")
        .map((t) => t.trim()),
      studentNames: (formData.get("studentNames") as string)
        .split(",")
        .map((t) => t.trim()),
      githubUrl: formData.get("githubUrl") || undefined,
      websiteUrl: formData.get("websiteUrl") || undefined,
    } as any;
    await updateProject(editProject.id, data);
    await refreshProjects();
    setIsEditOpen(false);
    setEditProject(null);
  }

  async function handleDelete(id: string) {
    await deleteProject(id);
    await refreshProjects();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Department Projects</h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} projects
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentNames">
                  Student Names (comma separated)
                </Label>
                <Input
                  id="studentNames"
                  name="studentNames"
                  placeholder="e.g., Rahul, Priya"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  defaultValue={new Date().getFullYear()}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technologies">
                  Technologies (comma separated)
                </Label>
                <Input id="technologies" name="technologies" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="ongoing">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL (optional)</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  placeholder="https://..."
                />
              </div>
              <Button type="submit" className="w-full">
                Add Project
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle className="text-base">{project.title}</CardTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                  <Badge
                    variant={
                      project.status === "completed" ? "default" : "secondary"
                    }
                  >
                    {project.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditProject(project);
                      setIsEditOpen(true);
                    }}
                    title="Edit Project"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(project.id)}
                    title="Delete Project"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
              {project.studentNames && project.studentNames.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  By: {project.studentNames.join(", ")}
                </p>
              )}
              <div className="flex gap-2">
                {project.githubUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 mr-1" />
                      GitHub
                    </a>
                  </Button>
                )}
                {project.websiteUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={project.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && (
          <p className="col-span-2 text-center py-8 text-muted-foreground">
            No projects yet
          </p>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editProject && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editProject.title}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editProject.description}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentNames">
                  Student Names (comma separated)
                </Label>
                <Input
                  id="studentNames"
                  name="studentNames"
                  defaultValue={(editProject.studentNames || []).join(", ")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    defaultValue={editProject.year}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editProject.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="technologies">
                  Technologies (comma separated)
                </Label>
                <Input
                  id="technologies"
                  name="technologies"
                  defaultValue={editProject.technologies.join(", ")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  defaultValue={editProject.githubUrl}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL (optional)</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  defaultValue={editProject.websiteUrl}
                />
              </div>
              <Button type="submit" className="w-full">
                Update Project
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NoticesTab({
  notices,
  teacherId,
}: {
  notices: Notice[];
  teacherId: string;
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editNotice, setEditNotice] = useState<Notice | null>(null);
  const {
    addNotice,
    updateNotice,
    deleteNotice,
    mutate: refreshNotices,
  } = useNotices();

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),
      isActive: true,
      publishedAt: new Date().toISOString(),
      expiresAt: null,
    };
    await addNotice(data as any);
    await refreshNotices();
    setIsAddOpen(false);
  }

  async function handleDelete(id: string) {
    await deleteNotice(id);
    await refreshNotices();
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editNotice) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),
      isActive: (formData.get("isActive") as string) === "on",
      expiresAt: formData.get("expiresAt") || null,
    } as any;
    await updateNotice(editNotice.id, data as any);
    await refreshNotices();
    setIsEditOpen(false);
    setEditNotice(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Notices</h2>
          <p className="text-sm text-muted-foreground">
            {notices.length} active notices
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Post Notice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post New Notice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" name="content" rows={4} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue="general">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Post Notice
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <Card key={notice.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle className="text-base">{notice.title}</CardTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                  <Badge variant="outline">{notice.category}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditNotice(notice);
                      setIsEditOpen(true);
                    }}
                    title="Edit Notice"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(notice.id)}
                    title="Delete Notice"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {formatDate(notice.publishedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{notice.content}</p>
            </CardContent>
          </Card>
        ))}
        {notices.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">
            No notices yet
          </p>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
          </DialogHeader>
          {editNotice && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editNotice.title}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  rows={4}
                  defaultValue={editNotice.content}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={editNotice.category}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="date"
                  defaultValue={editNotice.expiresAt as any}
                />
                <Label htmlFor="isActive" className="ml-2">
                  Active
                </Label>
                <Input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  defaultChecked={editNotice.isActive}
                />
              </div>
              <Button type="submit" className="w-full">
                Update Notice
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
