import { z } from "zod";

// ProductCategory values matching Laravel database
const ProductCategoryValues = ["JASA", "PRODUK"] as const;

export const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  category: z.enum(ProductCategoryValues),
  imageUrl: z.string().optional().or(z.literal("")),
});

export const updateProductSchema = createProductSchema.partial();

export const getProductQuerySchema = z.object({
  q: z.string().optional(),
  category: z.enum(ProductCategoryValues).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  postedById: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["name", "price", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
