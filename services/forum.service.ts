import prisma from "@/lib/prisma";
import {
  cacheGet,
  cacheSet,
  cacheDeletePattern,
  CacheKeys,
  CacheTTL,
} from "@/lib/cache";
import {
  createForumSchema,
  updateForumSchema,
  getForumQuerySchema,
  createCommentSchema,
  updateCommentSchema,
  getCommentsQuerySchema,
} from "@/validators/forum.schema";
import { z } from "zod";

type CreateForumData = z.infer<typeof createForumSchema>;
type UpdateForumData = z.infer<typeof updateForumSchema>;
type CreateCommentData = z.infer<typeof createCommentSchema>;
type UpdateCommentData = z.infer<typeof updateCommentSchema>;

export class ForumService {
  static async getAll(query: z.infer<typeof getForumQuerySchema>) {
    const {
      page = 1,
      limit = 10,
      q,
      postedById,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const cacheKey = CacheKeys.forumsList(page, limit, q);
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }

    if (postedById) whereClause.postedById = postedById;

    const [forums, total] = await Promise.all([
      prisma.forum.findMany({
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
              profilePictureUrl: true,
            },
          },
          _count: {
            select: {
              comments: true,
              forumLikes: true,
            },
          },
        },
      }),
      prisma.forum.count({ where: whereClause }),
    ]);

    const result = {
      data: forums,
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

  static async getById(id: string, userId?: string) {
    const cacheKey = CacheKeys.forumsItem(id);
    const cached = await cacheGet<any>(cacheKey);

    let forum = cached;
    if (!forum) {
      forum = await prisma.forum.findUnique({
        where: { id },
        include: {
          postedBy: {
            select: {
              id: true,
              name: true,
              profilePictureUrl: true,
            },
          },
          _count: {
            select: {
              comments: true,
              forumLikes: true,
            },
          },
        },
      });

      if (!forum) throw new Error("Forum not found");

      await cacheSet(cacheKey, forum, CacheTTL.LONG);
    }

    let isLiked = false;
    if (userId) {
      const like = await prisma.forumLike.findUnique({
        where: {
          forumId_likedById: {
            forumId: id,
            likedById: userId,
          },
        },
      });
      isLiked = !!like;
    }

    return {
      ...forum,
      isLiked,
    };
  }

  static async create(userId: string, data: CreateForumData) {
    const createData: any = {
      title: data.title,
      content: data.content,
      postedById: userId,
    };

    if (data.imageUrl) createData.imageUrl = data.imageUrl;

    const forum = await prisma.forum.create({
      data: createData,
    });

    await cacheDeletePattern(CacheKeys.forumsPattern());

    return forum;
  }

  static async update(
    userId: string,
    role: string,
    forumId: string,
    data: UpdateForumData,
  ) {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
    });
    if (!forum) throw new Error("Forum not found");

    if (role !== "Admin" && forum.postedById !== userId) {
      throw new Error("Forbidden: You are not authorized to update this forum");
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.imageUrl !== undefined)
      updateData.imageUrl = data.imageUrl || null;

    const updated = await prisma.forum.update({
      where: { id: forumId },
      data: updateData,
    });

    await cacheDeletePattern(CacheKeys.forumsPattern());

    return updated;
  }

  static async delete(userId: string, role: string, forumId: string) {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
    });
    if (!forum) throw new Error("Forum not found");

    if (role !== "Admin" && forum.postedById !== userId) {
      throw new Error("Forbidden: You are not authorized to delete this forum");
    }

    await prisma.forum.delete({ where: { id: forumId } });

    await cacheDeletePattern(CacheKeys.forumsPattern());

    return { message: "Forum deleted successfully" };
  }

  static async getComments(
    forumId: string,
    query: z.infer<typeof getCommentsQuerySchema>,
  ) {
    const { page = 1, limit = 10, sortOrder = "asc" } = query;

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.forumComment.findMany({
        where: { forumId },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        include: {
          postedBy: {
            select: {
              id: true,
              name: true,
              profilePictureUrl: true,
            },
          },
        },
      }),
      prisma.forumComment.count({ where: { forumId } }),
    ]);

    return {
      data: comments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createComment(
    userId: string,
    forumId: string,
    data: CreateCommentData,
  ) {
    const forum = await prisma.forum.findUnique({ where: { id: forumId } });
    if (!forum) throw new Error("Forum not found");

    const comment = await prisma.forumComment.create({
      data: {
        content: data.content,
        postedById: userId,
        forumId,
      },
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

    await cacheDeletePattern(CacheKeys.forumsPattern());

    return comment;
  }

  static async updateComment(
    userId: string,
    role: string,
    commentId: string,
    data: UpdateCommentData,
  ) {
    const comment = await prisma.forumComment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new Error("Comment not found");

    if (role !== "Admin" && comment.postedById !== userId) {
      throw new Error(
        "Forbidden: You are not authorized to update this comment",
      );
    }

    return await prisma.forumComment.update({
      where: { id: commentId },
      data: { content: data.content },
    });
  }

  static async deleteComment(userId: string, role: string, commentId: string) {
    const comment = await prisma.forumComment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new Error("Comment not found");

    if (role !== "Admin" && comment.postedById !== userId) {
      throw new Error(
        "Forbidden: You are not authorized to delete this comment",
      );
    }

    await prisma.forumComment.delete({ where: { id: commentId } });

    await cacheDeletePattern(CacheKeys.forumsPattern());

    return { message: "Comment deleted successfully" };
  }

  static async toggleLike(userId: string, forumId: string) {
    const forum = await prisma.forum.findUnique({ where: { id: forumId } });
    if (!forum) throw new Error("Forum not found");

    const existingLike = await prisma.forumLike.findUnique({
      where: {
        forumId_likedById: {
          forumId,
          likedById: userId,
        },
      },
    });

    let result;
    if (existingLike) {
      await prisma.forumLike.delete({
        where: { id: existingLike.id },
      });
      result = { message: "Forum unliked", isLiked: false };
    } else {
      await prisma.forumLike.create({
        data: {
          forumId,
          likedById: userId,
        },
      });
      result = { message: "Forum liked", isLiked: true };
    }

    await cacheDeletePattern(CacheKeys.forumsPattern());

    return result;
  }

  static async getLikes(forumId: string) {
    const likes = await prisma.forumLike.findMany({
      where: { forumId },
      include: {
        likedBy: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      data: likes,
      total: likes.length,
    };
  }
}
