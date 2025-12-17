import prisma from "@/lib/prisma";
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

    return {
      data: forums,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string, userId?: string) {
    const forum = await prisma.forum.findUnique({
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

    // Check if current user has liked this forum
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

    return await prisma.forum.create({
      data: createData,
    });
  }

  static async update(
    userId: string,
    role: string,
    forumId: string,
    data: UpdateForumData
  ) {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
    });
    if (!forum) throw new Error("Forum not found");

    // Authorization: Owner or Admin
    if (role !== "Admin" && forum.postedById !== userId) {
      throw new Error("Forbidden: You are not authorized to update this forum");
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.imageUrl !== undefined)
      updateData.imageUrl = data.imageUrl || null;

    return await prisma.forum.update({
      where: { id: forumId },
      data: updateData,
    });
  }

  static async delete(userId: string, role: string, forumId: string) {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
    });
    if (!forum) throw new Error("Forum not found");

    // Authorization: Owner or Admin
    if (role !== "Admin" && forum.postedById !== userId) {
      throw new Error("Forbidden: You are not authorized to delete this forum");
    }

    await prisma.forum.delete({ where: { id: forumId } });
    return { message: "Forum deleted successfully" };
  }

  // Comment methods
  static async getComments(
    forumId: string,
    query: z.infer<typeof getCommentsQuerySchema>
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
    data: CreateCommentData
  ) {
    // Check if forum exists
    const forum = await prisma.forum.findUnique({ where: { id: forumId } });
    if (!forum) throw new Error("Forum not found");

    return await prisma.forumComment.create({
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
  }

  static async updateComment(
    userId: string,
    role: string,
    commentId: string,
    data: UpdateCommentData
  ) {
    const comment = await prisma.forumComment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new Error("Comment not found");

    // Authorization: Owner or Admin
    if (role !== "Admin" && comment.postedById !== userId) {
      throw new Error(
        "Forbidden: You are not authorized to update this comment"
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

    // Authorization: Owner or Admin
    if (role !== "Admin" && comment.postedById !== userId) {
      throw new Error(
        "Forbidden: You are not authorized to delete this comment"
      );
    }

    await prisma.forumComment.delete({ where: { id: commentId } });
    return { message: "Comment deleted successfully" };
  }

  // Like methods
  static async toggleLike(userId: string, forumId: string) {
    // Check if forum exists
    const forum = await prisma.forum.findUnique({ where: { id: forumId } });
    if (!forum) throw new Error("Forum not found");

    // Check if user already liked
    const existingLike = await prisma.forumLike.findUnique({
      where: {
        forumId_likedById: {
          forumId,
          likedById: userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.forumLike.delete({
        where: { id: existingLike.id },
      });
      return { message: "Forum unliked", isLiked: false };
    } else {
      // Like
      await prisma.forumLike.create({
        data: {
          forumId,
          likedById: userId,
        },
      });
      return { message: "Forum liked", isLiked: true };
    }
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
