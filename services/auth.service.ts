import prisma from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/validators/auth.schema";
import { z } from "zod";
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "@/lib/auth";

type RegisterData = z.infer<typeof registerSchema>;
type LoginData = z.infer<typeof loginSchema>;

export class AuthService {
  static async register(data: RegisterData) {
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

    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      throw new Error("City not found");
    }

    if (city.provinceId !== provinceId) {
      throw new Error("City does not belong to the selected Province");
    }

    const hashedPassword = await hashPassword(password);

    let finalRoleId = roleId;

    if (!finalRoleId) {
      const alumniRole = await prisma.role.findUnique({
        where: { name: "Alumni" },
      });
      if (!alumniRole) {
        throw new Error("Default role 'Alumni' not found");
      }
      finalRoleId = alumniRole.id;
    }

    const newUser = await prisma.user.create({
      data: {
        ...rest,
        email,
        nim,
        phoneNumber,
        password: hashedPassword,
        role: { connect: { id: finalRoleId } },
        province: { connect: { id: provinceId } },
        city: { connect: { id: cityId } },
        faculty: { connect: { id: facultyId } },
        major: { connect: { id: majorId } },
      },
      include: {
        role: true,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  static async login(data: LoginData) {
    const { nim, password } = data;

    const user = await prisma.user.findUnique({
      where: { nim },
      include: { role: true },
    });

    if (!user) {
      throw new Error("Invalid NIM or password");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid NIM or password");
    }

    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role.name,
      nim: user.nim,
    });
    const refreshToken = signRefreshToken({
      userId: user.id,
      role: user.role.name,
      nim: user.nim,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  static async refreshToken(oldRefreshToken: string) {
    const payload = await verifyRefreshToken(oldRefreshToken);

    if (!payload || !payload.userId) {
      throw new Error("Invalid refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { role: true },
    });

    if (!user || user.refreshToken !== oldRefreshToken) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = signAccessToken({
      userId: user.id,
      role: user.role.name,
      nim: user.nim,
    });
    const newRefreshToken = signRefreshToken({
      userId: user.id,
      role: user.role.name,
      nim: user.nim,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  static async me(accessToken: string) {
    const payload = await verifyRefreshToken(accessToken); 

    return await AuthService.getUserFromToken(accessToken);
  }

  private static async getUserFromToken(token: string) {
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
      throw new Error("Invalid access token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: {
        role: true,
        province: true,
        city: true,
        faculty: true,
        major: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }
}
