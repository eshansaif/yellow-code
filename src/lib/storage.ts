import { put, del } from "@vercel/blob";
import * as cld from "./cloudinary";
// Cloudinary if all three keys are set; otherwise Vercel Blob if BLOB_READ_WRITE_TOKEN is set.
const hasCld = () => !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
export async function uploadFile(file: File, folder: string, resource: "image" | "raw" = "image") {
  if (hasCld()) return cld.uploadFile(file, folder, resource);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const b = await put(`${folder}/${safe}`, file, { access: "public", addRandomSuffix: true, contentType: file.type });
    return { secure_url: b.url, public_id: b.url, width: undefined as number | undefined, height: undefined as number | undefined };
  }
  throw new Error("No storage configured. Set the Cloudinary keys or BLOB_READ_WRITE_TOKEN.");
}
export async function deleteFile(publicId: string) {
  if (publicId.startsWith("https://")) { if (process.env.BLOB_READ_WRITE_TOKEN) await del(publicId); return; }
  if (hasCld()) await cld.deleteFile(publicId);
}
