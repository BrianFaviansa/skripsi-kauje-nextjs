import { NextRequest, NextResponse } from "next/server";
import { ForumService } from "@/services/forum.service";
import { updateForumSchema } from "@/validators/forum.schema";
import { verifyAccessToken } from "@/lib/auth";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    // Try to get userId from token if available
    let userId: string | undefined;
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = await verifyAccessToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    const forum = await ForumService.getById(params.id, userId);

    return NextResponse.json(
      { message: "Forum retrieved successfully", data: forum },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "Forum not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Get forum by id error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await req.json();
    const validatedData = updateForumSchema.parse(body);

    const updatedForum = await ForumService.update(
      payload.userId,
      payload.role,
      params.id,
      validatedData
    );

    return NextResponse.json(
      {
        message: "Forum updated successfully",
        data: updatedForum,
      },
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
    if (error.message === "Forum not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Update forum error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const result = await ForumService.delete(
      payload.userId,
      payload.role,
      params.id
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    if (error.message === "Forum not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Delete forum error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
