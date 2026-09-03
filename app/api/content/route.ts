import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { persistContent } from "@/lib/github";
import { validateContent } from "@/lib/validateContent";

// GET is intentionally public: the content it returns is the same content
// already rendered on the public homepage, and the admin dashboard uses this
// endpoint to always start editing from the latest saved version.
export async function GET() {
  return NextResponse.json(getContent());
}

export async function PUT(request: NextRequest) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const validationError = validateContent(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const result = await persistContent(body);
    return NextResponse.json({ ok: true, mode: result.mode, detail: result.detail });
  } catch (err) {
    console.error("[api/content] échec de la publication:", err);
    const message = err instanceof Error ? err.message : "Échec de la publication.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
