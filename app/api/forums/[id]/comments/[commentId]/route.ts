import { NextRequest, NextResponse } from "next/server";
import { ForumService } from "@/services/forum.service";
import { updateCommentSchema } from "@/validators/forum.schema";
import { verifyAccessToken } from "@/lib/auth";
import { ZodError } from "zod";

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string; commentId: string }> }
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
    const validatedData = updateCommentSchema.parse(body);

    const updatedComment = await ForumService.updateComment(
      payload.userId,
      payload.role,
      params.commentId,
      validatedData
    );

    return NextResponse.json(
      { message: "Comment updated successfully", data: updatedComment },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.flatten() },
        { status: 400 }
      );
    }
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    if (error.message === "Comment not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Update comment error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string; commentId: string }> }
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

    const result = await ForumService.deleteComment(
      payload.userId,
      payload.role,
      params.commentId
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    if (error.message === "Comment not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
