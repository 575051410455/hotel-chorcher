import { Hono } from "hono";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { ApiResponse } from "../types";

// Upload directory path
const UPLOAD_DIR = join(process.cwd(), "uploads");

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split(".").pop() || "jpg";
  return `${timestamp}-${random}.${ext}`;
}

const uploadRoute = new Hono()
  // Upload single image
  .post("/image", async (c) => {
    try {
      await ensureUploadDir();

      const body = await c.req.parseBody();
      const file = body["file"];

      if (!file || !(file instanceof File)) {
        return c.json<ApiResponse>({ success: false, error: "No file uploaded" }, 400);
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return c.json<ApiResponse>(
          { success: false, error: "Invalid file type. Only JPEG, PNG, GIF, WEBP allowed" },
          400
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return c.json<ApiResponse>(
          { success: false, error: "File too large. Max size is 10MB" },
          400
        );
      }

      // Generate filename and save
      const filename = generateFilename(file.name);
      const filepath = join(UPLOAD_DIR, filename);

      const arrayBuffer = await file.arrayBuffer();
      await writeFile(filepath, Buffer.from(arrayBuffer));

      // Return the URL path
      const imageUrl = `/uploads/${filename}`;

      console.log(`[Upload] Saved image: ${filename}`);

      return c.json<ApiResponse<{ url: string; filename: string }>>({
        success: true,
        data: {
          url: imageUrl,
          filename: filename,
        },
      });
    } catch (error: any) {
      console.error("[Upload] Error:", error);
      return c.json<ApiResponse>({ success: false, error: error.message || "Upload failed" }, 500);
    }
  })

  // Upload base64 image
  .post("/base64", async (c) => {
    try {
      await ensureUploadDir();

      const { image, filename: originalFilename } = await c.req.json<{
        image: string;
        filename?: string;
      }>();

      if (!image) {
        return c.json<ApiResponse>({ success: false, error: "No image data provided" }, 400);
      }

      // Parse base64 data
      const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        return c.json<ApiResponse>({ success: false, error: "Invalid base64 image format" }, 400);
      }

      const ext = matches[1];
      const base64Data = matches[2];

      // Validate extension
      const allowedExts = ["jpeg", "jpg", "png", "gif", "webp"];
      if (!ext || !allowedExts.includes(ext)) {
        return c.json<ApiResponse>(
          { success: false, error: "Invalid image type. Only JPEG, PNG, GIF, WEBP allowed" },
          400
        );
      }

      // Generate filename and save
      const filename = generateFilename(originalFilename || `image.${ext}`);
      const filepath = join(UPLOAD_DIR, filename);

      const buffer = Buffer.from(base64Data, "base64");

      // Validate size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return c.json<ApiResponse>(
          { success: false, error: "File too large. Max size is 10MB" },
          400
        );
      }

      await writeFile(filepath, buffer);

      const imageUrl = `/uploads/${filename}`;

      console.log(`[Upload] Saved base64 image: ${filename}`);

      return c.json<ApiResponse<{ url: string; filename: string }>>({
        success: true,
        data: {
          url: imageUrl,
          filename: filename,
        },
      });
    } catch (error: any) {
      console.error("[Upload] Error:", error);
      return c.json<ApiResponse>({ success: false, error: error.message || "Upload failed" }, 500);
    }
  })

  // Delete image
  .delete("/:filename", async (c) => {
    try {
      const filename = c.req.param("filename");

      if (!filename) {
        return c.json<ApiResponse>({ success: false, error: "Filename required" }, 400);
      }

      // Prevent directory traversal
      if (filename.includes("..") || filename.includes("/")) {
        return c.json<ApiResponse>({ success: false, error: "Invalid filename" }, 400);
      }

      const filepath = join(UPLOAD_DIR, filename);

      if (!existsSync(filepath)) {
        return c.json<ApiResponse>({ success: false, error: "File not found" }, 404);
      }

      await unlink(filepath);

      console.log(`[Upload] Deleted image: ${filename}`);

      return c.json<ApiResponse>({ success: true });
    } catch (error: any) {
      console.error("[Upload] Delete error:", error);
      return c.json<ApiResponse>({ success: false, error: error.message || "Delete failed" }, 500);
    }
  });

export default uploadRoute;