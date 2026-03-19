import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";

export async function GET(request: NextRequest) {
  const raw = request.cookies.get("datematch_session")?.value || "";
  const payload = raw ? verifySessionToken(raw) : null;

  if (!payload) {
    return NextResponse.json({ isAuthenticated: false });
  }

  return NextResponse.json({
    isAuthenticated: true,
    email: payload.email,
    expiresAt: payload.exp,
  });
}
