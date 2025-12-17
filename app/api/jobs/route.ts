import { NextRequest, NextResponse } from "next/server";
import { JobService } from "@/services/job.service";
import { getJobQuerySchema, createJobSchema } from "@/validators/job.schema";
import { verifyAccessToken } from "@/lib/auth";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());

    const validatedQuery = getJobQuerySchema.parse(query);

    const result = await JobService.getAll(validatedQuery);

    return NextResponse.json(
      { message: "Jobs retrieved successfully", ...result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get jobs error:", error);
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
    const validatedData = createJobSchema.parse(body);

    const newJob = await JobService.create(payload.userId, validatedData);

    return NextResponse.json(
      { message: "Job created successfully", data: newJob },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Create job error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
