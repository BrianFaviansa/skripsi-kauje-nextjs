import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/validators/auth.schema";
import { AuthService } from "@/services/auth.service";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    let body;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    const validatedData = registerSchema.parse(body);

    const user = await AuthService.register(validatedData);

    return NextResponse.json(
      { message: "Registration successful", data: user },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.flatten() },
        { status: 400 }
      );
    }

    if (error.message.includes("already registered")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
