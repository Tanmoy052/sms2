"use client";

import type React from "react";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  useStudents,
  useNotices,
  useProjects,
  useAttendance,
} from "@/hooks/use-persistent-store";
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
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import type {
  Teacher,
  Student,
  Attendance,
  Notice,
  Project,
} from "@/lib/types";
import {
  generateAttendancePDF,
  generateDateWiseAttendancePDF,
} from "@/lib/pdf-generator";
import { mutate } from "swr";

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { students } = useStudents();
  const { notices } = useNotices();
  const { projects } = useProjects();
  const { attendance } = useAttendance();

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
      } catch {
        router.push("/login?type=teacher");
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, [router]);

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!teacher) return;

    const formData = new FormData(e.currentTarget);
    const photoInput = document.getElementById(
      "teacher-profile-photo-value"
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
    (s) => s.department === teacher.department
  );
  const deptProjects = projects.filter(
    (p) => p.department === teacher.department
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
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
            <Badge variant="outline" className="ml-2 text-xs">
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
          <h1 className="text-2xl font-bold">Welcome, {teacher.name}</h1>
          <p className="text-muted-foreground">{teacher.department}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
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
              students={deptStudents}
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
    new Date().toISOString().split("T")[0]
  );
  const [subject, setSubject] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
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
    new Date().toISOString().split("T")[0]
  );

  // Get available semesters from students
  const availableSemesters = [...new Set(students.map((s) => s.semester))].sort(
    (a, b) => a - b
  );

  // Get unique subjects from attendance records
  const uniqueSubjects = useMemo(() => {
    const subjects = [...new Set(attendance.map((a) => a.subject))];
    return subjects.sort();
  }, [attendance]);

  // Filter students by semester
  const filteredStudents = useMemo(() => {
    return selectedSemester === "all"
      ? students
      : students.filter((s) => s.semester.toString() === selectedSemester);
  }, [students, selectedSemester]);

  // Filter attendance for history view - auto-load previous 1 month
  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      const matchesSubject =
        historySubject === "all" || a.subject === historySubject;
      const matchesDate =
        a.date >= historyStartDate && a.date <= historyEndDate;
      const studentInDept = students.some((s) => s.id === a.studentId);
      return matchesSubject && matchesDate && studentInDept;
    });
  }, [attendance, historySubject, historyStartDate, historyEndDate, students]);

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

  // Initialize all filtered students with no status by default
  useEffect(() => {
    const initialData: Record<string, "present" | "absent" | null> = {};
    filteredStudents.forEach((s) => {
      initialData[s.id] = null;
    });
    setAttendanceData(initialData);
  }, [filteredStudents]);

  async function handleSaveAttendance() {
    if (!subject) {
      alert("Please enter a subject");
      return;
    }

    const unset = Object.values(attendanceData).filter(
      (v) => v === null
    ).length;
    if (unset > 0) {
      alert("Please set Present/Absent for all students");
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
          teacherId
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
      (a) => a.subject === historySubject
    );
    const relevantStudentIds = [
      ...new Set(subjectAttendance.map((a) => a.studentId)),
    ];
    const relevantStudents = students.filter((s) =>
      relevantStudentIds.includes(s.id)
    );

    generateAttendancePDF({
      subject: historySubject,
      department,
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
      (a) => a.date === date && a.subject === subj
    );
    const relevantStudentIds = [
      ...new Set(dateAttendance.map((a) => a.studentId)),
    ];
    const relevantStudents = students.filter((s) =>
      relevantStudentIds.includes(s.id)
    );

    generateDateWiseAttendancePDF({
      date,
      subject: subj,
      department,
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
        <TabsList>
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
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>
                Select semester, date, subject and mark attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Semester</Label>
                <Tabs
                  value={selectedSemester}
                  onValueChange={setSelectedSemester}
                >
                  <TabsList className="flex-wrap h-auto gap-1">
                    <TabsTrigger value="all">All Semesters</TabsTrigger>
                    {availableSemesters.map((sem) => (
                      <TabsTrigger key={sem} value={sem.toString()}>
                        Sem {sem}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Data Structures"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAll("present")}
                  className="gap-1"
                >
                  <CheckCircle className="h-4 w-4" /> Present All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAll("absent")}
                  className="gap-1"
                >
                  <XCircle className="h-4 w-4" /> Absent All
                </Button>
                <span className="text-xs text-muted-foreground ml-auto">
                  {Object.values(attendanceData).some((v) => v === null)
                    ? "Not all students marked"
                    : ""}
                </span>
              </div>

              <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                {filteredStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-8">
                        {index + 1}.
                      </span>
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                        {student.photo ? (
                          <Image
                            src={student.photo || "/placeholder.svg"}
                            alt={student.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-mono">
                            {student.rollNumber}
                          </span>
                          <span className="ml-2">Sem {student.semester}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={
                          attendanceData[student.id] === "present"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="gap-1"
                        onClick={() =>
                          setAttendanceData((prev) => ({
                            ...prev,
                            [student.id]: "present",
                          }))
                        }
                      >
                        <CheckCircle className="h-4 w-4" /> Present
                      </Button>
                      <Button
                        variant={
                          attendanceData[student.id] === "absent"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="gap-1"
                        onClick={() =>
                          setAttendanceData((prev) => ({
                            ...prev,
                            [student.id]: "absent",
                          }))
                        }
                      >
                        <XCircle className="h-4 w-4" /> Absent
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {attendanceData[student.id] === null
                          ? "Not set"
                          : attendanceData[student.id]}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    No students in selected semester
                  </p>
                )}
              </div>

              <Button
                onClick={handleSaveAttendance}
                className="w-full gap-2"
                disabled={
                  isSaving ||
                  filteredStudents.length === 0 ||
                  Object.values(attendanceData).some((v) => v === null)
                }
              >
                <Save className="h-4 w-4" />
                {isSaving
                  ? "Saving..."
                  : `Save Attendance (${filteredStudents.length} students)`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance History Tab */}
        <TabsContent value="history" className="mt-4 space-y-4">
          {/* Filters Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Attendance Records
              </CardTitle>
              <CardDescription>
                Previous 1 month data is automatically loaded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={historySubject}
                    onValueChange={setHistorySubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {uniqueSubjects.map((subj) => (
                        <SelectItem key={subj} value={subj}>
                          {subj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={historyStartDate}
                    onChange={(e) => setHistoryStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={historyEndDate}
                    onChange={(e) => setHistoryEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    onClick={handleDownloadSubjectReport}
                    className="w-full gap-2"
                    disabled={historySubject === "all"}
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject-wise Summary */}
          {historySubject !== "all" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Subject Summary: {historySubject}
                </CardTitle>
                <CardDescription>
                  {historyStartDate} to {historyEndDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredStudents.map((student) => {
                    const studentAttendance = filteredAttendance.filter(
                      (a) =>
                        a.studentId === student.id &&
                        a.subject === historySubject
                    );
                    const presentCount = studentAttendance.filter(
                      (a) => a.status === "present"
                    ).length;
                    const total = studentAttendance.length;
                    const percent =
                      total > 0 ? Math.round((presentCount / total) * 100) : 0;

                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                            {student.photo ? (
                              <Image
                                src={student.photo || "/placeholder.svg"}
                                alt={student.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-mono">
                                {student.rollNumber}
                              </span>
                              <span className="ml-2">
                                Sem {student.semester}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              percent >= 75 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {percent}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {presentCount}/{total} classes
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date-wise Records */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Date-wise Attendance Records
              </CardTitle>
              <CardDescription>
                {Object.keys(groupedAttendance).length} days of records found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {Object.entries(groupedAttendance)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, subjects]) => (
                    <div key={date} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(date).toLocaleDateString("en-IN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(subjects).map(([subj, records]) => {
                          const presentCount = records.filter(
                            (r) => r.status === "present"
                          ).length;
                          const absentCount = records.filter(
                            (r) => r.status === "absent"
                          ).length;
                          return (
                            <div
                              key={subj}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">
                                  {subj}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge
                                  variant="outline"
                                  className="text-green-600 border-green-200"
                                >
                                  {presentCount} Present
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-red-600 border-red-200"
                                >
                                  {absentCount} Absent
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDownloadDateReport(date, subj)
                                  }
                                  className="gap-1"
                                >
                                  <FileText className="h-4 w-4" />
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
                  <p className="text-center py-8 text-muted-foreground">
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
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{project.title}</CardTitle>
                <div className="flex items-center gap-2">
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
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{notice.title}</CardTitle>
                <div className="flex items-center gap-2">
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
                {new Date(notice.publishedAt).toLocaleDateString()}
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
