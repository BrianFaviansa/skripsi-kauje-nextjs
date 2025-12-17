import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/validators/auth.schema";
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
    const validatedData = loginSchema.parse(body);

    const result = await AuthService.login(validatedData);

    return NextResponse.json(
      {
        message: "Login successful",
        accessToken: result.accessToken,
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

    if (error.message === "Invalid NIM or password") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
