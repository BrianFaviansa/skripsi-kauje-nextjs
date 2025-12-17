import prisma from "@/lib/prisma";
import {
  createNewsSchema,
  updateNewsSchema,
  getNewsQuerySchema,
} from "@/validators/news.schema";
import { z } from "zod";

type CreateNewsData = z.infer<typeof createNewsSchema>;
type UpdateNewsData = z.infer<typeof updateNewsSchema>;

export class NewsService {
  static async getAll(query: z.infer<typeof getNewsQuerySchema>) {
    const {
      page = 1,
      limit = 10,
      q,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }

    // Date range filter
    if (startDate !== undefined || endDate !== undefined) {
      whereClause.date = {};
      if (startDate !== undefined) whereClause.date.gte = startDate;
      if (endDate !== undefined) whereClause.date.lte = endDate;
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
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
      prisma.news.count({ where: whereClause }),
    ]);

    return {
      data: news,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const news = await prisma.news.findUnique({
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

    if (!news) throw new Error("News not found");

    return news;
  }

  static async create(userId: string, role: string, data: CreateNewsData) {
    // Only admin can create news
    if (role !== "Admin") {
      throw new Error("Forbidden: Only admins can create news");
    }

    const createData: any = {
      title: data.title,
      content: data.content,
      date: data.date,
      postedById: userId,
    };

    if (data.imageUrl) createData.imageUrl = data.imageUrl;

    return await prisma.news.create({
      data: createData,
    });
  }

  static async update(
    userId: string,
    role: string,
    newsId: string,
    data: UpdateNewsData
  ) {
    // Only admin can update news
    if (role !== "Admin") {
      throw new Error("Forbidden: Only admins can update news");
    }

    const news = await prisma.news.findUnique({
      where: { id: newsId },
    });
    if (!news) throw new Error("News not found");

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.imageUrl !== undefined)
      updateData.imageUrl = data.imageUrl || null;

    return await prisma.news.update({
      where: { id: newsId },
      data: updateData,
    });
  }

  static async delete(userId: string, role: string, newsId: string) {
    // Only admin can delete news
    if (role !== "Admin") {
      throw new Error("Forbidden: Only admins can delete news");
    }

    const news = await prisma.news.findUnique({
      where: { id: newsId },
    });
    if (!news) throw new Error("News not found");

    await prisma.news.delete({ where: { id: newsId } });
    return { message: "News deleted successfully" };
  }
}
