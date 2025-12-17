import { NextRequest, NextResponse } from "next/server";
import { NewsService } from "@/services/news.service";
import { updateNewsSchema } from "@/validators/news.schema";
import { verifyAccessToken } from "@/lib/auth";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const news = await NewsService.getById(params.id);

    return NextResponse.json(
      { message: "News retrieved successfully", data: news },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "News not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Get news by id error:", error);
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
    const validatedData = updateNewsSchema.parse(body);

    const updatedNews = await NewsService.update(
      payload.userId,
      payload.role,
      params.id,
      validatedData
    );

    return NextResponse.json(
      {
        message: "News updated successfully",
        data: updatedNews,
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
    if (error.message === "News not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Update news error:", error);
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

    const result = await NewsService.delete(
      payload.userId,
      payload.role,
      params.id
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    if (error.message === "News not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Delete news error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
