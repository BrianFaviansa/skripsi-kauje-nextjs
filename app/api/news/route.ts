import { NextRequest, NextResponse } from "next/server";
import { NewsService } from "@/services/news.service";
import { getNewsQuerySchema, createNewsSchema } from "@/validators/news.schema";
import { verifyAccessToken } from "@/lib/auth";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());

    const validatedQuery = getNewsQuerySchema.parse(query);

    const result = await NewsService.getAll(validatedQuery);

    return NextResponse.json(
      { message: "News retrieved successfully", ...result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get news error:", error);
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
    const validatedData = createNewsSchema.parse(body);

    const newNews = await NewsService.create(
      payload.userId,
      payload.role,
      validatedData
    );

    return NextResponse.json(
      { message: "News created successfully", data: newNews },
      { status: 201 }
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
    console.error("Create news error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
