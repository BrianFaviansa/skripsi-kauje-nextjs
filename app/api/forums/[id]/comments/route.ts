import { NextRequest, NextResponse } from "next/server";
import { ForumService } from "@/services/forum.service";
import {
  getCommentsQuerySchema,
  createCommentSchema,
} from "@/validators/forum.schema";
import { verifyAccessToken } from "@/lib/auth";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());

    const validatedQuery = getCommentsQuerySchema.parse(query);

    const result = await ForumService.getComments(params.id, validatedQuery);

    return NextResponse.json(
      { message: "Comments retrieved successfully", ...result },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
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

    const body = await req.json();
    const validatedData = createCommentSchema.parse(body);

    const newComment = await ForumService.createComment(
      payload.userId,
      params.id,
      validatedData,
    );

    return NextResponse.json(
      { message: "Comment created successfully", data: newComment },
      { status: 201 },
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.flatten() },
        { status: 400 },
      );
    }
    if (error.message === "Forum not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Create comment error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}
