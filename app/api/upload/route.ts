import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { persistUpload } from "@/lib/upload";

// Comfortably under hosting platforms' request body limits (Vercel: 4.5 MB).
const MAX_BYTES = 4 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  const extension = EXTENSION_BY_MIME[file.type];
  if (!extension) {
    return NextResponse.json({ error: "Format non supporté (utilise une image PNG, JPG, WEBP ou GIF)." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image trop lourde (4 Mo maximum)." }, { status: 400 });
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await persistUpload(fileName, buffer, file.type);
    return NextResponse.json({ ok: true, url: result.url, mode: result.mode });
  } catch (err) {
    console.error("[api/upload] échec de l’envoi:", err);
    const message = err instanceof Error ? err.message : "Échec de l’envoi de l’image.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
