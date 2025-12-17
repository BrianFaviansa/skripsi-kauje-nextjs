import { NextRequest, NextResponse } from "next/server";
import { refreshTokenSchema } from "@/validators/auth.schema";
import { AuthService } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { oldRefreshToken } = refreshTokenSchema.parse(body);

    if (!oldRefreshToken) {
      return NextResponse.json(
        { message: "Refresh token is required" },
        { status: 400 }
      );
    }

    const result = await AuthService.refreshToken(oldRefreshToken);

    return NextResponse.json(
      {
        message: "Token refreshed successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "Invalid refresh token") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    console.error("Refresh token error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
