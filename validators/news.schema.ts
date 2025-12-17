import { z } from "zod";

export const createNewsSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  date: z.coerce.date(),
  imageUrl: z.string().optional().or(z.literal("")),
});

export const updateNewsSchema = createNewsSchema.partial();

export const getNewsQuerySchema = z.object({
  q: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["title", "date", "createdAt"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
