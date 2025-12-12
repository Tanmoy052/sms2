"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import type { Attendance, Student } from "@/lib/types";
import { useAttendance, useStudents } from "@/hooks/use-persistent-store";

export default function AttendancePage() {
  const {
    attendance,
    isLoading,
    addAttendance,
    updateAttendance,
    deleteAttendance,
  } = useAttendance();
  const { students } = useStudents();
  const [editRecord, setEditRecord] = useState<Attendance | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      studentId: formData.get("studentId"),
      date: formData.get("date"),
      status: formData.get("status"),
      subject: formData.get("subject"),
      markedBy: "1", // admin
    };

    await addAttendance(data as any);
    setIsAddOpen(false);
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editRecord) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      studentId: formData.get("studentId"),
      date: formData.get("date"),
      status: formData.get("status"),
      subject: formData.get("subject"),
    };
    await updateAttendance(editRecord.id, data as any);
    setIsEditOpen(false);
    setEditRecord(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this record?")) return;
    await deleteAttendance(id);
  }

  const availableDepartments = Array.from(
    new Set((students || []).map((s) => s.department))
  );
  const deptStudentIds = (students || [])
    .filter(
      (s) => selectedDepartment === "all" || s.department === selectedDepartment
    )
    .map((s) => s.id);
  const filteredAttendance = (attendance || []).filter((a) => {
    const matchesDept =
      selectedDepartment === "all" || deptStudentIds.includes(a.studentId);
    const matchesDate = !selectedDate || a.date === selectedDate;
    const matchesSubject =
      selectedSubject === "all" || a.subject === selectedSubject;
    return matchesDept && matchesDate && matchesSubject;
  });
  const availableSubjects = Array.from(
    new Set(filteredAttendance.map((a) => a.subject))
  ).sort();

  const getStudentName = (studentId: string) => {
    const student = students?.find((s) => s.id === studentId);
    return student ? `${student.name} (${student.rollNumber})` : "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage student attendance
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Attendance Record</DialogTitle>
            </DialogHeader>
            <AttendanceForm students={students || []} onSubmit={handleAdd} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{attendance?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {attendance?.filter((a) => a.status === "present").length ||
                    0}
                </p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {attendance?.filter((a) => a.status === "absent").length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {attendance?.filter((a) => a.status === "late").length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Filter: Department → Date → Subject
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {availableDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {availableSubjects.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Showing {filteredAttendance.length} records
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {getStudentName(record.studentId)}
                    </TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.status === "present"
                            ? "default"
                            : record.status === "late"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditRecord(record);
                          setIsEditOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAttendance?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
          </DialogHeader>
          {editRecord && (
            <AttendanceForm
              record={editRecord}
              students={students || []}
              onSubmit={handleEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AttendanceForm({
  record,
  students,
  onSubmit,
}: {
  record?: Attendance;
  students: Student[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="studentId">Student</Label>
        <Select name="studentId" defaultValue={record?.studentId || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name} ({student.rollNumber})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={record?.date}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          defaultValue={record?.subject}
          placeholder="e.g., Data Structures"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={record?.status || "present"}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button type="submit">{record ? "Update" : "Add"} Record</Button>
      </div>
    </form>
  );
}
