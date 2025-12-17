import { NextRequest, NextResponse } from "next/server";
import { ForumService } from "@/services/forum.service";
import {
  getForumQuerySchema,
  createForumSchema,
} from "@/validators/forum.schema";
import { verifyAccessToken } from "@/lib/auth";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());

    const validatedQuery = getForumQuerySchema.parse(query);

    const result = await ForumService.getAll(validatedQuery);

    return NextResponse.json(
      { message: "Forums retrieved successfully", ...result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get forums error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
    const validatedData = createForumSchema.parse(body);

    const newForum = await ForumService.create(payload.userId, validatedData);

    return NextResponse.json(
      { message: "Forum created successfully", data: newForum },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Create forum error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
