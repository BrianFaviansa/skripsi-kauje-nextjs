import prisma from "@/lib/prisma";
import {
  createJobSchema,
  updateJobSchema,
  getJobQuerySchema,
} from "@/validators/job.schema";
import { z } from "zod";

type CreateJobData = z.infer<typeof createJobSchema>;
type UpdateJobData = z.infer<typeof updateJobSchema>;

export class JobService {
  static async getAll(query: z.infer<typeof getJobQuerySchema>) {
    const {
      page = 1,
      limit = 10,
      q,
      jobType,
      provinceId,
      cityId,
      jobFieldId,
      company,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }

    if (jobType) whereClause.jobType = jobType;
    if (provinceId) whereClause.provinceId = provinceId;
    if (cityId) whereClause.cityId = cityId;
    if (jobFieldId) whereClause.jobFieldId = jobFieldId;
    if (company)
      whereClause.company = { contains: company, mode: "insensitive" };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        skip,
        take: limit,
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        include: {
          jobField: true,
          province: true,
          city: true,
          postedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.job.count({ where: whereClause }),
    ]);

    const simplifiedJobs = jobs.map((job) => ({
      ...job,
      jobField: job.jobField.name,
      province: job.province.name,
      city: job.city.name,
    }));

    return {
      data: simplifiedJobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        jobField: true,
        province: true,
        city: true,
        postedBy: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    if (!job) throw new Error("Job not found");

    return {
      ...job,
      jobField: job.jobField.name,
      province: job.province.name,
      city: job.city.name,
    };
  }

  static async create(userId: string, data: CreateJobData) {
    return await prisma.job.create({
      data: {
        ...data,
        postedById: userId,
      },
    });
  }

  static async update(
    userId: string,
    role: string,
    jobId: string,
    data: UpdateJobData
  ) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");

    // Authorization: Owner or Admin
    if (role !== "Admin" && job.postedById !== userId) {
      throw new Error("Forbidden: You are not authorized to update this job");
    }

    return await prisma.job.update({
      where: { id: jobId },
      data,
    });
  }

  static async delete(userId: string, role: string, jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");

    // Authorization: Owner or Admin
    if (role !== "Admin" && job.postedById !== userId) {
      throw new Error("Forbidden: You are not authorized to delete this job");
    }

    await prisma.job.delete({ where: { id: jobId } });
    return { message: "Job deleted successfully" };
  }
}
