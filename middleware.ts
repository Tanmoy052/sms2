import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: any) {
  const token = req.cookies.get("adminToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin-login", req.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin-login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
