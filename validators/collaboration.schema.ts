import { z } from "zod";

export const createCollaborationSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  imageUrl: z.string().optional().or(z.literal("")),
  collaborationFieldId: z.cuid().optional().or(z.literal("")),
});

export const updateCollaborationSchema = createCollaborationSchema.partial();

export const getCollaborationQuerySchema = z.object({
  q: z.string().optional(),
  collaborationFieldId: z.cuid().optional(),
  postedById: z.cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["title", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
