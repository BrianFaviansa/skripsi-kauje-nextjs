import { NextRequest, NextResponse } from "next/server";
import { ForumService } from "@/services/forum.service";
import { verifyAccessToken } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = await verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await ForumService.toggleLike(payload.userId, params.id);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.message === "Forum not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Toggle like error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
