import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";
import {
  getProductQuerySchema,
  createProductSchema,
} from "@/validators/product.schema";
import { verifyAccessToken } from "@/lib/auth";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());

    const validatedQuery = getProductQuerySchema.parse(query);

    const result = await ProductService.getAll(validatedQuery);

    return NextResponse.json(
      { message: "Products retrieved successfully", ...result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get products error:", error);
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
    const validatedData = createProductSchema.parse(body);

    const newProduct = await ProductService.create(
      payload.userId,
      validatedData
    );

    return NextResponse.json(
      { message: "Product created successfully", data: newProduct },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Create product error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
