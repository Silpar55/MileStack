import { NextRequest, NextResponse } from "next/server";
import { downloadService } from "@/shared/download-service";
import { verifyAccessToken } from "@/shared/auth";
import archiver from "archiver";

export async function POST(
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

    const body = await request.json();
    const { format } = body;

    if (!format || !["clean", "portfolio", "template"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be clean, portfolio, or template" },
        { status: 400 }
      );
    }

    const downloadPackage = await downloadService.generateDownloadPackage(
      decoded.userId,
      params.assignment_id,
      format
    );

    // Create ZIP archive
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk) => {
      chunks.push(chunk);
    });

    // Add files to archive
    for (const file of downloadPackage.files) {
      if (file.type === "file") {
        archive.append(file.content, { name: file.name });
      } else if (file.type === "folder") {
        archive.directory(file.name, file.name);
      }
    }

    // Add academic integrity documentation
    archive.append(JSON.stringify(downloadPackage.documentation, null, 2), {
      name: "academic-integrity.json",
    });

    // Add metadata
    archive.append(JSON.stringify(downloadPackage.metadata, null, 2), {
      name: "metadata.json",
    });

    await archive.finalize();

    // Wait for archive to complete
    await new Promise((resolve, reject) => {
      archive.on("end", resolve);
      archive.on("error", reject);
    });

    const zipBuffer = Buffer.concat(chunks);
    const filename = `${params.assignment_id}-${format}-${Date.now()}.zip`;

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating download package:", error);
    return NextResponse.json(
      { error: "Failed to generate download package" },
      { status: 500 }
    );
  }
}
