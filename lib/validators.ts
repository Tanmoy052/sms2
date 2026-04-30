import { z } from "zod";

export const StudentCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  rollNumber: z.string().regex(/^349\d{8}$/),
  department: z.string().min(1),
  semester: z.number().int().min(1).max(8),
  phone: z.string().min(1),
  address: z.string().min(1),
  dateOfBirth: z.string().min(1),
  admissionYear: z.number().int().min(2000).max(2100),
  guardianName: z.string().min(1),
  guardianPhone: z.string().min(1),
  status: z.enum(["active", "inactive", "graduated"]),
  photo: z.string().optional(),
});

export const StudentUpdateSchema = StudentCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const TeacherCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  employeeId: z.string().min(1),
  department: z.string().min(1),
  designation: z.string().min(1),
  phone: z.string().min(1),
  qualification: z.string().min(1),
  specialization: z.string().min(1),
  joiningDate: z.string().min(1),
  status: z.enum(["active", "on-leave", "retired"]),
  photo: z.string().optional(),
});

export const TeacherUpdateSchema = TeacherCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);
