type PersistUploadResult = {
  mode: "blob" | "local";
  url: string;
};

function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Saves an image uploaded from the Atelier. In production this goes to
 * Vercel Blob storage (BLOB_READ_WRITE_TOKEN is auto-provided once a Blob
 * store is created and connected to the Vercel project) — a proper file
 * host, unlike committing binary files into the GitHub repo, which the
 * portfolio content itself still does (see lib/github.ts) since that's
 * small, diffable JSON, not the same tradeoff as photos.
 *
 * Without BLOB_READ_WRITE_TOKEN (typically local development), this falls
 * back to writing straight to public/uploads on disk, mirroring the local
 * dev fallback used for content.json.
 */
export async function persistUpload(fileName: string, content: Buffer, contentType: string): Promise<PersistUploadResult> {
  if (isBlobConfigured()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${fileName}`, content, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return { mode: "blob", url: blob.url };
  }

  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), content);
  return { mode: "local", url: `/uploads/${fileName}` };
}
