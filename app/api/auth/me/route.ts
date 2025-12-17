import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.split(" ")[1];

    const user = await AuthService.me(accessToken);

    return NextResponse.json(
      {
        message: "User details retrieved successfully",
        data: user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "Invalid access token") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    if (error.message === "User not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error("Auth me error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
