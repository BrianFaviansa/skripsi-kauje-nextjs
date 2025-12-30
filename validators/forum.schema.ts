import { z } from "zod";

// Forum schemas
export const createForumSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  imageUrl: z.string().optional().or(z.literal("")),
});

export const updateForumSchema = createForumSchema.partial();

export const getForumQuerySchema = z.object({
  q: z.string().optional(),
  postedById: z.uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["title", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Comment schemas
export const createCommentSchema = z.object({
  content: z.string().min(1),
});

export const updateCommentSchema = createCommentSchema.partial();

export const getCommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
