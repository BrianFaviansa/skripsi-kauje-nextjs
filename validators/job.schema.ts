import { JobType } from "@/app/generated/prisma/client";
import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  company: z.string().min(2),
  jobType: z.enum(JobType),
  openFrom: z.coerce.date(),
  openUntil: z.coerce.date(),
  registrationLink: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  provinceId: z.uuid(),
  cityId: z.uuid(),
  jobFieldId: z.uuid(),
});

export const updateJobSchema = createJobSchema.partial();

export const getJobQuerySchema = z.object({
  q: z.string().optional(),
  jobType: z.enum(JobType).optional(),
  provinceId: z.uuid().optional(),
  cityId: z.uuid().optional(),
  jobFieldId: z.uuid().optional(),
  company: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["title", "openFrom", "openUntil", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
