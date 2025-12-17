import { z } from "zod";

export const registerSchema = z.object({
  nim: z.string().min(5),
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(5),
  phoneNumber: z.string().min(10),
  enrollmentYear: z.coerce.number(),
  graduationYear: z.coerce.number(),
  roleId: z.cuid().optional(),
  provinceId: z.cuid(),
  cityId: z.cuid(),
  facultyId: z.cuid(),
  majorId: z.cuid(),
  verificationFileUrl: z.string().min(1),
});

export const loginSchema = z.object({
  nim: z.string().min(5),
  password: z.string().min(5),
});

export const meSchema = z.object({
  accessToken: z.string(),
});


export const refreshTokenSchema = z.object({
  oldRefreshToken: z.string(),
});
