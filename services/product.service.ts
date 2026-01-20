import prisma from "@/lib/prisma";
import {
  cacheGet,
  cacheSet,
  cacheDeletePattern,
  CacheKeys,
  CacheTTL,
} from "@/lib/cache";
import {
  createProductSchema,
  updateProductSchema,
  getProductQuerySchema,
} from "@/validators/product.schema";
import { z } from "zod";

type CreateProductData = z.infer<typeof createProductSchema>;
type UpdateProductData = z.infer<typeof updateProductSchema>;

export class ProductService {
  static async getAll(query: z.infer<typeof getProductQuerySchema>) {
    const {
      page = 1,
      limit = 10,
      q,
      category,
      minPrice,
      maxPrice,
      postedById,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const cacheKey = CacheKeys.productsList(page, limit, q);
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category) whereClause.category = category;
    if (postedById) whereClause.postedById = postedById;

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      if (minPrice !== undefined) whereClause.price.gte = minPrice;
      if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        include: {
          postedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    const result = {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await cacheSet(cacheKey, result, CacheTTL.MEDIUM);

    return result;
  }

  static async getById(id: string) {
    const cacheKey = CacheKeys.productsItem(id);
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    if (!product) throw new Error("Product not found");

    await cacheSet(cacheKey, product, CacheTTL.LONG);

    return product;
  }

  static async create(userId: string, data: CreateProductData) {
    const createData: any = {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      postedById: userId,
    };

    if (data.imageUrl) createData.imageUrl = data.imageUrl;

    const product = await prisma.product.create({
      data: createData,
    });

    await cacheDeletePattern(CacheKeys.productsPattern());

    return product;
  }

  static async update(
    userId: string,
    role: string,
    productId: string,
    data: UpdateProductData,
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    if (role !== "Admin" && product.postedById !== userId) {
      throw new Error(
        "Forbidden: You are not authorized to update this product",
      );
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.imageUrl !== undefined)
      updateData.imageUrl = data.imageUrl || null;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    await cacheDeletePattern(CacheKeys.productsPattern());

    return updated;
  }

  static async delete(userId: string, role: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    if (role !== "Admin" && product.postedById !== userId) {
      throw new Error(
        "Forbidden: You are not authorized to delete this product",
      );
    }

    await prisma.product.delete({ where: { id: productId } });

    await cacheDeletePattern(CacheKeys.productsPattern());

    return { message: "Product deleted successfully" };
  }
}
