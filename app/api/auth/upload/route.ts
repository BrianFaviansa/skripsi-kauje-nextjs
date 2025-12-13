import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const originalName = file.name;
    const extension = originalName.split(".").pop();
    const filename = `${uuidv4()}.${extension}`;

    const uploadDir = join(process.cwd(), "public/uploads/verification");
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/verification/${filename}`;

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        data: { url: fileUrl },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
