import { NextRequest, NextResponse } from "next/server";
import { ForumService } from "@/services/forum.service";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const result = await ForumService.getLikes(params.id);

    return NextResponse.json(
      { message: "Likes retrieved successfully", ...result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get likes error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
