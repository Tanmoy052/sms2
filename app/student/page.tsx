"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
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
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Bell,
  FolderKanban,
  Github,
  Globe,
  Plus,
  Trash2,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import type { Student, Attendance, Notice, Project } from "@/lib/types";
import {
  useAttendance,
  useNotices,
  useProjects,
} from "@/hooks/use-persistent-store";
import { parseStudentRollNumber } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNoticeAddOpen, setIsNoticeAddOpen] = useState(false);
  const [isNoticeEditOpen, setIsNoticeEditOpen] = useState(false);
  const [editNotice, setEditNotice] = useState<Notice | null>(null);

  const {
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    mutate: refreshNotices,
  } = useNotices();
  const { data: projects } = useSWR<Project[]>("/api/projects", fetcher);
  const {
    projects: allProjects,
    addProject,
    updateProject,
    deleteProject,
    mutate: refreshProjects,
  } = useProjects();
  const { attendance } = useAttendance();

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        if (!session || session.role !== "student") {
          router.push("/login?type=student");
          return;
        }
        setStudent(session.user as Student);
      } catch {
        router.push("/login?type=student");
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, [router]);

  async function handleAddNotice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),
      isActive: true,
      publishedAt: new Date().toISOString(),
      expiresAt: null,
    } as any;
    await addNotice(data);
    await refreshNotices();
    setIsNoticeAddOpen(false);
  }

  async function handleDeleteNotice(id: string) {
    await deleteNotice(id);
    await refreshNotices();
  }

  async function handleEditNotice(e: React.FormEvent<HTMLFormElement>) {
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
    await updateNotice(editNotice.id, data);
    await refreshNotices();
    setIsNoticeEditOpen(false);
    setEditNotice(null);
  }

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!student) return;

    const formData = new FormData(e.currentTarget);
    const photoInput = document.getElementById(
      "student-profile-photo-value"
    ) as HTMLInputElement;

    const data = {
      phone: formData.get("phone"),
      address: formData.get("address"),
      photo: photoInput?.value || student.photo,
    };

    const res = await fetch(`/api/students/${student.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const updatedStudent = await res.json();
      setStudent(updatedStudent);
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

  if (!student) return null;

  const activeNotices = notices?.filter((n) => n.isActive)?.slice(0, 5) || [];
  const studentAttendance = (attendance || []).filter(
    (a) => a.studentId === student.id
  );
  const presentCount = studentAttendance.filter(
    (a) => a.status === "present"
  ).length;
  const absentCount = studentAttendance.filter(
    (a) => a.status === "absent"
  ).length;
  const lateCount = studentAttendance.filter((a) => a.status === "late").length;
  const totalClasses = studentAttendance.length;
  const attendancePercent =
    totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  const rollInfo = parseStudentRollNumber(student.rollNumber);
  const deptProjects = (allProjects || []).filter(
    (p) => p.department === student.department
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
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
            <div>
              <span className="font-semibold text-sm">Student Portal</span>
              {rollInfo && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {rollInfo.department.split(" ")[0]}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = "/api/auth/logout")}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome, {student.name}</h1>
          <p className="text-muted-foreground">
            Roll No:{" "}
            <span className="font-mono font-semibold">
              {student.rollNumber}
            </span>{" "}
            | {student.department}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <CheckCircle className="h-4 w-4" />
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
              student={student}
              isEditOpen={isEditOpen}
              setIsEditOpen={setIsEditOpen}
              onUpdateProfile={handleUpdateProfile}
            />
          </TabsContent>

          <TabsContent value="attendance">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Summary</CardTitle>
                  <CardDescription>Your attendance record</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p
                      className={`text-4xl font-bold ${
                        attendancePercent >= 75
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {attendancePercent}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Overall Attendance
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-green-600">
                        {presentCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Present</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-center">
                      <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-red-600">
                        {absentCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Absent</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg text-center">
                      <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-yellow-600">
                        {lateCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Late</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance</CardTitle>
                  <CardDescription>Last 10 classes</CardDescription>
                </CardHeader>
                <CardContent>
                  {studentAttendance.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No attendance records yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {studentAttendance.slice(0, 10).map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <p className="text-sm font-medium">{a.subject}</p>
                            <p className="text-xs text-muted-foreground">
                              {a.date}
                            </p>
                          </div>
                          <Badge
                            variant={
                              a.status === "present"
                                ? "default"
                                : a.status === "late"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {a.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5" />
                      Department Projects
                    </CardTitle>
                    <Badge variant="outline">{student.department}</Badge>
                  </div>
                  <CardDescription>
                    Projects from your department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {deptProjects.map((project) => (
                      <Card key={project.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">
                              {project.title}
                            </CardTitle>
                            <Badge
                              variant={
                                project.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {project.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.map((tech) => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          {project.studentNames &&
                            project.studentNames.length > 0 && (
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
                    {deptProjects.length === 0 && (
                      <p className="col-span-2 text-center py-8 text-muted-foreground">
                        No projects yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Add / Edit Projects
                  </CardTitle>
                  <CardDescription>
                    Manage projects visible to all portals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectCrud studentDept={student.department} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notices">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Notices</h2>
                  <p className="text-sm text-muted-foreground">
                    All published notices
                  </p>
                </div>
                <Dialog
                  open={isNoticeAddOpen}
                  onOpenChange={setIsNoticeAddOpen}
                >
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
                    <form onSubmit={handleAddNotice} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          name="content"
                          rows={4}
                          required
                        />
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
                {activeNotices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No notices available
                  </p>
                ) : (
                  activeNotices.map((notice) => (
                    <Card key={notice.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{notice.title}</h3>
                            <Badge variant="outline">{notice.category}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditNotice(notice);
                                setIsNoticeEditOpen(true);
                              }}
                              title="Edit Notice"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteNotice(notice.id)}
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
                        <p className="text-sm text-muted-foreground">
                          {notice.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <Dialog
                open={isNoticeEditOpen}
                onOpenChange={setIsNoticeEditOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Notice</DialogTitle>
                  </DialogHeader>
                  {editNotice && (
                    <form onSubmit={handleEditNotice} className="space-y-4">
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
                        <Select
                          name="category"
                          defaultValue={editNotice.category}
                        >
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ProfileTab({
  student,
  isEditOpen,
  setIsEditOpen,
  onUpdateProfile,
}: {
  student: Student;
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  onUpdateProfile: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [photo, setPhoto] = useState(student.photo || "");

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
                      id="student-profile-photo-value"
                      value={photo}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" defaultValue={student.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={student.address}
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
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
            {student.photo ? (
              <Image
                src={student.photo || "/placeholder.svg"}
                alt={student.name}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-green-600" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{student.name}</h3>
            <p className="text-muted-foreground font-mono">
              {student.rollNumber}
            </p>
            <Badge
              variant={student.status === "active" ? "default" : "secondary"}
              className="mt-1"
            >
              {student.status}
            </Badge>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{student.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{student.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{student.department}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Semester {student.semester}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{student.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Guardian: {student.guardianName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function ProjectCrud({ studentDept }: { studentDept: string }) {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    mutate: refreshProjects,
  } = useProjects();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      department: studentDept,
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
    } as any;
    await addProject(data);
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
      department: studentDept,
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

  const deptProjects = projects.filter((p) => p.department === studentDept);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">My Department Projects</h3>
          <p className="text-sm text-muted-foreground">Add or edit projects</p>
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
                <Input id="studentNames" name="studentNames" />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="technologies">
                  Technologies (comma separated)
                </Label>
                <Input id="technologies" name="technologies" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
                <Input id="githubUrl" name="githubUrl" type="url" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL (optional)</Label>
                <Input id="websiteUrl" name="websiteUrl" type="url" />
              </div>
              <Button type="submit" className="w-full">
                Add Project
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {deptProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
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
        {deptProjects.length === 0 && (
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
