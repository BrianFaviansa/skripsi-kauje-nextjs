import { NextRequest, NextResponse } from "next/server";
import { JobService } from "@/services/job.service";
import { updateJobSchema } from "@/validators/job.schema";
import { verifyAccessToken } from "@/lib/auth";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const job = await JobService.getById(params.id);

    return NextResponse.json(
      { message: "Job retrieved successfully", data: job },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "Job not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Get job by id error:", error);
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
    const validatedData = updateJobSchema.parse(body);

    const updatedJob = await JobService.update(
      payload.userId,
      payload.role,
      params.id,
      validatedData
    );

    return NextResponse.json(
      { message: "Job updated successfully", data: updatedJob },
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
    if (error.message === "Job not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Update job error:", error);
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

    const result = await JobService.delete(
      payload.userId,
      payload.role,
      params.id
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    if (error.message === "Job not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("Delete job error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
