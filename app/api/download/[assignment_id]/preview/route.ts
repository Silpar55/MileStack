import { NextRequest, NextResponse } from "next/server";
import { downloadService } from "@/shared/download-service";
import { verifyAccessToken } from "@/shared/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { assignment_id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") as
      | "clean"
      | "portfolio"
      | "template";

    if (!format || !["clean", "portfolio", "template"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be clean, portfolio, or template" },
        { status: 400 }
      );
    }

    const packagePreview = await downloadService.generateDownloadPackage(
      decoded.userId,
      params.assignment_id,
      format
    );

    // Return preview without full file contents
    const preview = {
      format: packagePreview.format,
      fileCount: packagePreview.files.length,
      fileNames: packagePreview.files.map((f) => f.name),
      documentation: packagePreview.documentation,
      metadata: packagePreview.metadata,
    };

    return NextResponse.json(preview);
  } catch (error) {
    console.error("Error generating download preview:", error);
    return NextResponse.json(
      { error: "Failed to generate download preview" },
      { status: 500 }
    );
  }
}
