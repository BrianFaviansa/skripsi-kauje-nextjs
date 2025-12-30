import prisma from "@/lib/prisma";
import { createUserSchema, updateUserSchema } from "@/validators/user.schema";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";

type CreateUserData = z.infer<typeof createUserSchema>;
type UpdateUserData = z.infer<typeof updateUserSchema>;

export class UserService {
  static async getAll(query: z.infer<typeof createUserSchema> & any) {
    const {
      page = 1,
      limit = 10,
      q,
      facultyId,
      majorId,
      provinceId,
      cityId,
      enrollmentYear,
      graduationYear,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    const whereClause: any = {
      role: {
        name: {
          not: "Admin",
        },
      },
    };

    if (q) {
      whereClause.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { nim: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    if (facultyId) whereClause.facultyId = facultyId;
    if (majorId) whereClause.majorId = majorId;
    if (provinceId) whereClause.provinceId = provinceId;
    if (cityId) whereClause.cityId = cityId;
    if (enrollmentYear) whereClause.enrollmentYear = enrollmentYear;
    if (graduationYear) whereClause.graduationYear = graduationYear;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        include: {
          role: true,
          province: true,
          city: true,
          faculty: true,
          major: true,
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const safeUsers = users.map((user) => {
      const {
        password,
        refreshToken,
        roleId,
        provinceId,
        cityId,
        facultyId,
        majorId,
        role,
        province,
        city,
        faculty,
        major,
        ...userWithoutSensitive
      } = user;

      return {
        ...userWithoutSensitive,
        role: role?.name,
        province: province?.name,
        city: city?.name,
        faculty: faculty?.name,
        major: major?.name,
      };
    });

    return {
      data: safeUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        province: true,
        city: true,
        faculty: true,
        major: true,
      },
    });

    if (!user) throw new Error("User not found");

    const { password, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  static async create(
    data: CreateUserData,
    verificationStatus: "PENDING" | "VERIFIED" = "PENDING"
  ) {
    const {
      email,
      nim,
      phoneNumber,
      password,
      roleId,
      provinceId,
      cityId,
      facultyId,
      majorId,
      ...rest
    } = data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { nim }, { phoneNumber }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email)
        throw new Error("Email already registered");
      if (existingUser.nim === nim) throw new Error("NIM already registered");
      if (existingUser.phoneNumber === phoneNumber)
        throw new Error("Phone number already registered");
    }

    const hashedPassword = await hashPassword(password);

    let finalRoleId = roleId;
    if (!finalRoleId) {
      const alumniRole = await prisma.role.findUnique({
        where: { name: "Alumni" },
      });
      if (alumniRole) finalRoleId = alumniRole.id;
      else throw new Error("Default role Alumni not found");
    }

    const newUser = await prisma.user.create({
      data: {
        ...rest,
        email,
        nim,
        phoneNumber,
        password: hashedPassword,
        verificationStatus,
        role: { connect: { id: finalRoleId } },
        province: { connect: { id: provinceId } },
        city: { connect: { id: cityId } },
        faculty: { connect: { id: facultyId } },
        major: { connect: { id: majorId } },
      },
      include: { role: true },
    });

    const { password: _, refreshToken: __, ...safeUser } = newUser;
    return safeUser;
  }

  static async update(id: string, data: UpdateUserData) {
    const {
      password,
      roleId,
      provinceId,
      cityId,
      facultyId,
      majorId,
      ...rest
    } = data;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");

    const updateData: any = { ...rest };

    if (password) {
      updateData.password = await hashPassword(password);
    }
    if (roleId) updateData.role = { connect: { id: roleId } };
    if (provinceId) updateData.province = { connect: { id: provinceId } };
    if (cityId) updateData.city = { connect: { id: cityId } };
    if (facultyId) updateData.faculty = { connect: { id: facultyId } };
    if (majorId) updateData.major = { connect: { id: majorId } };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });

    const { password: _, refreshToken: __, ...safeUser } = updatedUser;
    return safeUser;
  }

  static async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");

    await prisma.user.delete({ where: { id } });
    return { message: "User deleted successfully" };
  }
}
