import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/validators/auth.schema";
import { AuthService } from "@/services/auth.service";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
