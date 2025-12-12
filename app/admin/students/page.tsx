"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Trash2, Search, User, RefreshCw } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"
import { persistentStore } from "@/lib/persistent-store"
import type { Student } from "@/lib/types"
import { DEPARTMENTS } from "@/lib/types"

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedDept, setSelectedDept] = useState<string>("all")
  const [selectedSemester, setSelectedSemester] = useState<string>("all")

  // Load students from persistent store
  const loadStudents = useCallback(() => {
    setIsLoading(true)
    const data = persistentStore.getStudents()
    setStudents(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadStudents()
    }, 0)
    return () => window.clearTimeout(id)
  }, [loadStudents])

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
    const matchesDept = selectedDept === "all" || s.department === selectedDept
    const matchesSemester = selectedSemester === "all" || s.semester.toString() === selectedSemester
    return matchesSearch && matchesDept && matchesSemester
  })

  const availableSemesters = [
    ...new Set(students.filter((s) => selectedDept === "all" || s.department === selectedDept).map((s) => s.semester)),
  ].sort((a, b) => a - b)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const photoInput = document.getElementById("add-photo-value") as HTMLInputElement

    const studentData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      rollNumber: formData.get("rollNumber") as string,
      phone: formData.get("phone") as string,
      department: formData.get("department") as string,
      semester: Number.parseInt(formData.get("semester") as string),
      dateOfBirth: formData.get("dateOfBirth") as string,
      admissionYear: Number.parseInt(formData.get("admissionYear") as string),
      address: formData.get("address") as string,
      guardianName: formData.get("guardianName") as string,
      guardianPhone: formData.get("guardianPhone") as string,
      status: formData.get("status") as "active" | "inactive" | "graduated",
      photo: photoInput?.value || "",
    }

    // Add to persistent store (localStorage)
    persistentStore.addStudent(studentData)

    // Also sync to server for session persistence
    await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    })

    loadStudents()
    setIsAddOpen(false)
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editStudent) return

    const formData = new FormData(e.currentTarget)
    const photoInput = document.getElementById("edit-photo-value") as HTMLInputElement

    const updateData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      rollNumber: formData.get("rollNumber") as string,
      phone: formData.get("phone") as string,
      department: formData.get("department") as string,
      semester: Number.parseInt(formData.get("semester") as string),
      dateOfBirth: formData.get("dateOfBirth") as string,
      admissionYear: Number.parseInt(formData.get("admissionYear") as string),
      address: formData.get("address") as string,
      guardianName: formData.get("guardianName") as string,
      guardianPhone: formData.get("guardianPhone") as string,
      status: formData.get("status") as "active" | "inactive" | "graduated",
      photo: photoInput?.value || editStudent.photo,
    }

    // Update in persistent store
    persistentStore.updateStudent(editStudent.id, updateData)

    // Sync to server
    await fetch(`/api/students/${editStudent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    })

    loadStudents()
    setIsEditOpen(false)
    setEditStudent(null)
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this student?")) return

    // Delete from persistent store
    persistentStore.deleteStudent(id)

    // Sync to server
    await fetch(`/api/students/${id}`, { method: "DELETE" })

    loadStudents()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-sm text-muted-foreground">Manage student records by department and semester</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadStudents} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <StudentForm onSubmit={handleAdd} idPrefix="add" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs
        value={selectedDept}
        onValueChange={(v) => {
          setSelectedDept(v)
          setSelectedSemester("all")
        }}
      >
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All Depts</TabsTrigger>
          {DEPARTMENTS.map((dept) => (
            <TabsTrigger key={dept} value={dept} className="text-xs">
              {dept.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {selectedDept !== "all" && availableSemesters.length > 0 && (
        <Tabs value={selectedSemester} onValueChange={setSelectedSemester}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All Semesters</TabsTrigger>
            {availableSemesters.map((sem) => (
              <TabsTrigger key={sem} value={sem.toString()} className="text-xs">
                Sem {sem}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground">{filteredStudents.length} students</p>
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
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="font-mono text-sm">{student.rollNumber}</TableCell>
                      <TableCell className="max-w-[120px] truncate text-xs">
                        {student.department.split(" ")[0]}
                      </TableCell>
                      <TableCell>Sem {student.semester}</TableCell>
                      <TableCell>{student.admissionYear}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            student.status === "active"
                              ? "bg-green-100 text-green-700"
                              : student.status === "graduated"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditStudent(student)
                              setIsEditOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No students found
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
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {editStudent && <StudentForm student={editStudent} onSubmit={handleEdit} idPrefix="edit" />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StudentForm({
  student,
  onSubmit,
  idPrefix,
}: {
  student?: Student
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  idPrefix: string
}) {
  const [photo, setPhoto] = useState(student?.photo || "")

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex justify-center">
        <div className="text-center">
          <Label className="mb-2 block">Student Photo</Label>
          <FileUpload value={photo} onChange={setPhoto} placeholder="Choose Photo" />
          <input type="hidden" id={`${idPrefix}-photo-value`} value={photo} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={student?.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={student?.email} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rollNumber">Roll Number</Label>
          <Input
            id="rollNumber"
            name="rollNumber"
            defaultValue={student?.rollNumber}
            required
            placeholder="34900123052"
          />
          <p className="text-xs text-muted-foreground">Format: 349 + dept code + year + serial</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={student?.phone} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select name="department" defaultValue={student?.department || DEPARTMENTS[0]}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="semester">Semester</Label>
          <Select name="semester" defaultValue={student?.semester?.toString() || "1"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <SelectItem key={sem} value={sem.toString()}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={student?.dateOfBirth} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admissionYear">Admission Year</Label>
          <Input
            id="admissionYear"
            name="admissionYear"
            type="number"
            defaultValue={student?.admissionYear || new Date().getFullYear()}
            required
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" defaultValue={student?.address} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardianName">Guardian Name</Label>
          <Input id="guardianName" name="guardianName" defaultValue={student?.guardianName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardianPhone">Guardian Phone</Label>
          <Input id="guardianPhone" name="guardianPhone" defaultValue={student?.guardianPhone} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={student?.status || "active"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="graduated">Graduated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">{student ? "Update" : "Add"} Student</Button>
      </div>
    </form>
  )
}
