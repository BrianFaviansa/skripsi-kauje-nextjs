import { NextRequest, NextResponse } from "next/server";
import { CollaborationService } from "@/services/collaboration.service";
import { updateCollaborationSchema } from "@/validators/collaboration.schema";
import { verifyAccessToken } from "@/lib/auth";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const collaboration = await CollaborationService.getById(params.id);

    return NextResponse.json(
      { message: "Collaboration retrieved successfully", data: collaboration },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "Collaboration not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Get collaboration by id error:", error);
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
    const validatedData = updateCollaborationSchema.parse(body);

    const updatedCollaboration = await CollaborationService.update(
      payload.userId,
      payload.role,
      params.id,
      validatedData
    );

    return NextResponse.json(
      {
        message: "Collaboration updated successfully",
        data: updatedCollaboration,
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
    if (error.message === "Collaboration not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Update collaboration error:", error);
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

    const result = await CollaborationService.delete(
      payload.userId,
      payload.role,
      params.id
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    if (error.message === "Collaboration not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Delete collaboration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
