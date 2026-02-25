"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Search, User, Eye, EyeOff } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import type { Teacher } from "@/lib/types";
import { DEPARTMENTS, DEPT_SHORT_CODES } from "@/lib/types";
import { useTeachers } from "@/hooks/use-api";

function PasswordCell({ password }: { password?: string }) {
  const [show, setShow] = useState(false);
  if (!password) return <span className="text-muted-foreground">-</span>;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs">{show ? password : "••••••••"}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      </Button>
    </div>
  );
}

export default function TeachersPage() {
  const { teachers, isLoading, addTeacher, updateTeacher, deleteTeacher } =
    useTeachers();
  const [search, setSearch] = useState("");
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>("all");

  // Department sort order
  const DEPT_ORDER = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Basic Science & Humanities",
  ];

  const filteredTeachers = teachers
    ?.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        t.department.toLowerCase().includes(search.toLowerCase());
      const matchesDept =
        selectedDept === "all" || t.department === selectedDept;
      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      // Sort by specific department order
      const deptA = DEPT_ORDER.indexOf(a.department);
      const deptB = DEPT_ORDER.indexOf(b.department);

      // If both departments are in our list, sort by index
      if (deptA !== -1 && deptB !== -1) {
        if (deptA !== deptB) return deptA - deptB;
      }

      // Fallback: If one is missing or both missing, or same dept, sort by name
      if (deptA !== -1 && deptB === -1) return -1;
      if (deptA === -1 && deptB !== -1) return 1;

      // Then by name
      return a.name.localeCompare(b.name);
    });

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const photoInput = document.getElementById(
      "add-teacher-photo-value",
    ) as HTMLInputElement;

    // Convert FormData to object with proper types
    const teacherData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      employeeId: formData.get("employeeId") as string,
      department: formData.get("department") as string,
      designation: formData.get("designation") as string,
      phone: formData.get("phone") as string,
      qualification: formData.get("qualification") as string,
      specialization: formData.get("specialization") as string,
      joiningDate: formData.get("joiningDate") as string,
      status: formData.get("status") as "active" | "on-leave" | "retired",
      photo: photoInput?.value || "",
    };

    try {
      await addTeacher(teacherData);
      setIsAddOpen(false);
    } catch (error) {
      console.error("Failed to add teacher:", error);
      alert("Failed to add teacher");
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editTeacher) return;

    const formData = new FormData(e.currentTarget);
    const photoInput = document.getElementById(
      "edit-teacher-photo-value",
    ) as HTMLInputElement;

    const updateData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      employeeId: formData.get("employeeId") as string,
      department: formData.get("department") as string,
      designation: formData.get("designation") as string,
      phone: formData.get("phone") as string,
      qualification: formData.get("qualification") as string,
      specialization: formData.get("specialization") as string,
      joiningDate: formData.get("joiningDate") as string,
      status: formData.get("status") as "active" | "on-leave" | "retired",
      photo: photoInput?.value || editTeacher.photo,
    };

    try {
      await updateTeacher(editTeacher.id, updateData);
      setIsEditOpen(false);
      setEditTeacher(null);
    } catch (error) {
      console.error("Failed to update teacher:", error);
      alert("Failed to update teacher");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await deleteTeacher(id);
    } catch (error) {
      console.error("Failed to delete teacher:", error);
      alert("Failed to delete teacher");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-sm text-muted-foreground">
            Manage faculty records by department
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <TeacherForm onSubmit={handleAdd} idPrefix="add-teacher" />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedDept} onValueChange={setSelectedDept}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All Departments</TabsTrigger>
          {DEPARTMENTS.map((dept) => (
            <TabsTrigger key={dept} value={dept} className="text-xs">
              {DEPT_SHORT_CODES[dept] || dept}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredTeachers?.length || 0} teachers
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers?.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                          {teacher.photo ? (
                            <Image
                              src={teacher.photo || "/placeholder.svg"}
                              alt={teacher.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {teacher.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {teacher.username}
                      </TableCell>
                      <TableCell>
                        <PasswordCell password={teacher.password} />
                      </TableCell>
                      <TableCell>{teacher.employeeId}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs font-mono uppercase">
                        {DEPT_SHORT_CODES[teacher.department] ||
                          teacher.department}
                      </TableCell>
                      <TableCell>{teacher.designation}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            teacher.status === "active"
                              ? "bg-green-100 text-green-700"
                              : teacher.status === "on-leave"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {teacher.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditTeacher(teacher);
                              setIsEditOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(teacher.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTeachers?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No teachers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>
          {editTeacher && (
            <TeacherForm
              teacher={editTeacher}
              onSubmit={handleEdit}
              idPrefix="edit-teacher"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeacherForm({
  teacher,
  onSubmit,
  idPrefix,
}: {
  teacher?: Teacher;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  idPrefix: string;
}) {
  const [photo, setPhoto] = useState(teacher?.photo || "");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex justify-center">
        <div className="text-center">
          <Label className="mb-2 block">Teacher Photo</Label>
          <FileUpload
            value={photo}
            onChange={setPhoto}
            placeholder="Choose Photo"
          />
          <input type="hidden" id={`${idPrefix}-photo-value`} value={photo} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={teacher?.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={teacher?.email}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employeeId">Employee ID</Label>
          <Input
            id="employeeId"
            name="employeeId"
            defaultValue={teacher?.employeeId}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={teacher?.phone}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            name="department"
            defaultValue={teacher?.department || DEPARTMENTS[0]}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {DEPT_SHORT_CODES[dept] || dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Select
            name="designation"
            defaultValue={teacher?.designation || "Assistant Professor"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Professor">Professor</SelectItem>
              <SelectItem value="Associate Professor">
                Associate Professor
              </SelectItem>
              <SelectItem value="Assistant Professor">
                Assistant Professor
              </SelectItem>
              <SelectItem value="Lecturer">Lecturer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="qualification">Qualification</Label>
          <Input
            id="qualification"
            name="qualification"
            defaultValue={teacher?.qualification}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            name="specialization"
            defaultValue={teacher?.specialization}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="joiningDate">Joining Date</Label>
          <Input
            id="joiningDate"
            name="joiningDate"
            type="date"
            defaultValue={teacher?.joiningDate}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={teacher?.status || "active"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-leave">On Leave</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">{teacher ? "Update" : "Add"} Teacher</Button>
      </div>
    </form>
  );
}
