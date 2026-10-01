import { createHash } from "node:crypto";
// Signed upload via Cloudinary REST (no SDK). Env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
export async function uploadFile(file: File, folder: string, resource: "image" | "raw" = "image") {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!, key = process.env.CLOUDINARY_API_KEY!, secret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  const body = new FormData(); body.set("file", file); body.set("folder", folder); body.set("timestamp", timestamp); body.set("api_key", key); body.set("signature", signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${resource}/upload`, { method: "POST", body });
  if (!res.ok) throw new Error("Upload failed");
  return (await res.json()) as { secure_url: string; public_id: string; width?: number; height?: number };
}
export async function deleteFile(publicId: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString(), secret = process.env.CLOUDINARY_API_SECRET!;
  const signature = createHash("sha1").update(`public_id=${publicId}&timestamp=${timestamp}${secret}`).digest("hex");
  const body = new FormData(); body.set("public_id", publicId); body.set("timestamp", timestamp); body.set("api_key", process.env.CLOUDINARY_API_KEY!); body.set("signature", signature);
  await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`, { method: "POST", body });
}
