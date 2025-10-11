interface LyzrAssetUploadResponse {
  asset_id: string;
  success: boolean;
  message?: string;
}

interface LyzrAssetUploadError {
  error: string;
  message: string;
}

export class LyzrAssetService {
  private readonly baseUrl = "https://agent-prod.studio.lyzr.ai";
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.AI_AGENTS_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("AI_AGENTS_API_KEY environment variable is required");
    }
  }

  /**
   * Upload a single file to Lyzr assets
   */
  async uploadFile(file: Buffer, filename: string): Promise<string> {
    console.log(
      `Uploading file to Lyzr assets: ${filename} (${file.length} bytes)`
    );

    const formData = new FormData();
    const blob = new Blob([file], { type: this.getMimeType(filename) });
    formData.append("files", blob, filename);

    try {
      const response = await fetch(`${this.baseUrl}/v3/assets/upload`, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Lyzr asset upload failed: ${response.status} ${response.statusText}`
        );
        console.error("Error response:", errorText);
        throw new Error(
          `Lyzr asset upload failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Lyzr upload response:", JSON.stringify(data, null, 2));

      // Parse the response structure - asset ID is in results array
      if (
        !data.results ||
        !Array.isArray(data.results) ||
        data.results.length === 0
      ) {
        console.error("No results array found in Lyzr response");
        throw new Error("Invalid response format from Lyzr upload");
      }

      const result = data.results[0];
      if (!result.success || !result.asset_id) {
        console.error("Upload failed or no asset_id in result:", result);
        throw new Error("Upload failed or no asset_id returned from Lyzr");
      }

      const assetId = result.asset_id;
      console.log(
        `Successfully uploaded ${filename} to Lyzr assets. Asset ID: ${assetId}`
      );
      return assetId;
    } catch (error) {
      console.error(`Error uploading file ${filename} to Lyzr assets:`, error);
      throw new Error(
        `Failed to upload ${filename} to Lyzr assets: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Upload multiple files to Lyzr assets in batch
   */
  async uploadBatch(
    files: Array<{ buffer: Buffer; filename: string }>
  ): Promise<string[]> {
    console.log(`Uploading batch of ${files.length} files to Lyzr assets`);

    if (files.length === 0) {
      return [];
    }

    if (files.length > 5) {
      throw new Error("Maximum 5 files allowed per batch upload");
    }

    // Upload files sequentially to avoid overwhelming the API
    const assetIds: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Uploading file ${i + 1}/${files.length}: ${file.filename}`);

      try {
        const assetId = await this.uploadFile(file.buffer, file.filename);
        assetIds.push(assetId);
      } catch (error) {
        // Fail immediately on first error as requested
        console.error(`Batch upload failed at file ${i + 1}:`, error);
        throw error;
      }
    }

    console.log(
      `Successfully uploaded batch. Asset IDs: ${assetIds.join(", ")}`
    );
    return assetIds;
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filename: string): string {
    const extension = filename.toLowerCase().split(".").pop();

    switch (extension) {
      case "pdf":
        return "application/pdf";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "doc":
        return "application/msword";
      case "txt":
        return "text/plain";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      default:
        return "application/octet-stream";
    }
  }

  /**
   * Validate file type against supported types
   */
  static validateFileType(filename: string): boolean {
    const supportedExtensions = [
      "pdf",
      "docx",
      "doc",
      "txt",
      "jpg",
      "jpeg",
      "png",
      "gif",
    ];
    const extension = filename.toLowerCase().split(".").pop();
    return supportedExtensions.includes(extension || "");
  }

  /**
   * Validate file size (15MB limit per Lyzr requirements)
   */
  static validateFileSize(fileSize: number): boolean {
    const maxSize = 15 * 1024 * 1024; // 15MB in bytes
    return fileSize <= maxSize;
  }
}

// Export singleton instance
export const lyzrAssetService = new LyzrAssetService();
