import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";
import { verifyPassword } from "@/lib/authPassword";

export async function POST(request: NextRequest) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";

  let isValid: boolean;
  try {
    isValid = verifyPassword(password);
  } catch (err) {
    console.error("[api/login] configuration manquante:", err);
    return NextResponse.json(
      { error: "Configuration serveur manquante (ADMIN_PASSWORD_HASH / ADMIN_PASSWORD_SALT)." },
      { status: 500 },
    );
  }

  if (!isValid) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
