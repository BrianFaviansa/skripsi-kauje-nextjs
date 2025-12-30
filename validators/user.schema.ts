import { z } from "zod";

export const createUserSchema = z.object({
  nim: z.string().min(5),
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(5),
  phoneNumber: z.string().min(10),
  enrollmentYear: z.coerce.number(),
  graduationYear: z.coerce.number(),
  roleId: z.uuid().optional(),
  provinceId: z.uuid(),
  cityId: z.uuid(),
  facultyId: z.uuid(),
  majorId: z.uuid(),
  verificationFileUrl: z.string().min(1),
  instance: z.string().optional(),
  position: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const getUserQuerySchema = z.object({
  q: z.string().optional(),
  facultyId: z.uuid().optional(),
  majorId: z.uuid().optional(),
  provinceId: z.uuid().optional(),
  cityId: z.uuid().optional(),
  enrollmentYear: z.coerce.number().int().optional(),
  graduationYear: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["name", "enrollmentYear", "graduationYear", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
