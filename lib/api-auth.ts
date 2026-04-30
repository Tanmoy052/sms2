import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  return { ok: true as const, session };
}

export async function requireRole(role: UserRole) {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  if (auth.session.role !== role) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return auth;
}
