import prisma from "@/lib/prisma";
import {
  cacheGet,
  cacheSet,
  cacheDeletePattern,
  CacheKeys,
  CacheTTL,
} from "@/lib/cache";
import {
  createCollaborationSchema,
  updateCollaborationSchema,
  getCollaborationQuerySchema,
} from "@/validators/collaboration.schema";
import { z } from "zod";

type CreateCollaborationData = z.infer<typeof createCollaborationSchema>;
type UpdateCollaborationData = z.infer<typeof updateCollaborationSchema>;

export class CollaborationService {
  static async getAll(query: z.infer<typeof getCollaborationQuerySchema>) {
    const {
      page = 1,
      limit = 10,
      q,
      collaborationFieldId,
      postedById,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const cacheKey = CacheKeys.collaborationsList(page, limit, q);
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

    if (collaborationFieldId)
      whereClause.collaborationFieldId = collaborationFieldId;
    if (postedById) whereClause.postedById = postedById;

    const [collaborations, total] = await Promise.all([
      prisma.collaboration.findMany({
        skip,
        take: limit,
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        include: {
          collaborationField: true,
          postedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.collaboration.count({ where: whereClause }),
    ]);

    const simplifiedCollaborations = collaborations.map((collaboration) => ({
      ...collaboration,
      collaborationField: collaboration.collaborationField?.name || null,
    }));

    const result = {
      data: simplifiedCollaborations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    await cacheSet(cacheKey, result, CacheTTL.MEDIUM);

    return result;
  }

  static async getById(id: string) {
    // Try cache first
    const cacheKey = CacheKeys.collaborationsItem(id);
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: { id },
      include: {
        collaborationField: true,
        postedBy: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    if (!collaboration) throw new Error("Collaboration not found");

    const result = {
      ...collaboration,
      collaborationField: collaboration.collaborationField?.name || null,
    };

    // Cache the result
    await cacheSet(cacheKey, result, CacheTTL.LONG);

    return result;
  }

  static async create(userId: string, data: CreateCollaborationData) {
    const createData: any = {
      title: data.title,
      content: data.content,
      postedById: userId,
    };

    if (data.imageUrl) createData.imageUrl = data.imageUrl;
    if (data.collaborationFieldId)
      createData.collaborationFieldId = data.collaborationFieldId;

    const collaboration = await prisma.collaboration.create({
      data: createData,
    });

    await cacheDeletePattern(CacheKeys.collaborationsPattern());

    return collaboration;
  }

  static async update(
    userId: string,
    role: string,
    collaborationId: string,
    data: UpdateCollaborationData,
  ) {
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
    });
    if (!collaboration) throw new Error("Collaboration not found");

    if (role !== "Admin" && collaboration.postedById !== userId) {
      throw new Error(
        "Forbidden: You are not authorized to update this collaboration",
      );
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.imageUrl !== undefined)
      updateData.imageUrl = data.imageUrl || null;
    if (data.collaborationFieldId !== undefined) {
      updateData.collaborationFieldId = data.collaborationFieldId || null;
    }

    const updated = await prisma.collaboration.update({
      where: { id: collaborationId },
      data: updateData,
    });

    await cacheDeletePattern(CacheKeys.collaborationsPattern());

    return updated;
  }

  static async delete(userId: string, role: string, collaborationId: string) {
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
    });
    if (!collaboration) throw new Error("Collaboration not found");

    if (role !== "Admin" && collaboration.postedById !== userId) {
      throw new Error(
        "Forbidden: You are not authorized to delete this collaboration",
      );
    }

    await prisma.collaboration.delete({ where: { id: collaborationId } });

    await cacheDeletePattern(CacheKeys.collaborationsPattern());

    return { message: "Collaboration deleted successfully" };
  }
}
