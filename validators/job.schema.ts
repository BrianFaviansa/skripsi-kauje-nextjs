import { z } from "zod";

// JobType values matching Laravel database
const JobTypeValues = ["LOKER", "MAGANG"] as const;

export const createJobSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  company: z.string().min(2),
  jobType: z.enum(JobTypeValues),
  openFrom: z.coerce.date(),
  openUntil: z.coerce.date(),
  registrationLink: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  provinceId: z.string().uuid(),
  cityId: z.string().uuid(),
  jobFieldId: z.string().uuid(),
});

export const updateJobSchema = createJobSchema.partial();

export const getJobQuerySchema = z.object({
  q: z.string().optional(),
  jobType: z.enum(JobTypeValues).optional(),
  provinceId: z.string().uuid().optional(),
  cityId: z.string().uuid().optional(),
  jobFieldId: z.string().uuid().optional(),
  company: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["title", "openFrom", "openUntil", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
