import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json(
        { message: "Access token is required" },
        { status: 400 }
      );
    }

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
